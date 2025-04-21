import { Request, Response } from 'express';
import { prisma } from '../config/database';
import logger from '../config/logger';
import { getDistanceFromLatLng } from '../utils/location';
import { calculateCompatibilityScore } from '../utils/matching';

// Get potential matches based on user preferences
export const getPotentialMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { limit = 20, skip = 0 } = req.query;

    // Get current user with their preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        basicInfo: true,
        relationshipPrefs: true,
      },
    });

    if (!currentUser || !currentUser.basicInfo || !currentUser.relationshipPrefs) {
      res.status(400).json({
        error: 'Incomplete profile',
        message: 'Please complete your profile and preferences to see matches',
      });
      return;
    }

    // Build filter based on preferences
    const gender = currentUser.basicInfo.gender;
    const preferredGenders =
      gender === 'Male'
        ? ['Female']
        : gender === 'Female'
          ? ['Male']
          : ['Male', 'Female', 'Non-binary', 'Other'];

    // Get user's current location
    const userLocation = currentUser.basicInfo.location as any;
    const coordinates = userLocation?.coordinates;

    // Get already liked/disliked and blocked users to exclude
    const existingInteractions = await prisma.match.findMany({
      where: {
        OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    const blockedUsers = await prisma.block.findMany({
      where: {
        OR: [{ blockerId: req.user.id }, { blockedId: req.user.id }],
      },
      select: {
        blockerId: true,
        blockedId: true,
      },
    });

    // Create excluded user IDs list
    const excludedUserIds = new Set<string>();
    existingInteractions.forEach((match) => {
      if (match.senderId !== req.user!.id) excludedUserIds.add(match.senderId);
      if (match.receiverId !== req.user!.id) excludedUserIds.add(match.receiverId);
    });

    blockedUsers.forEach((block) => {
      excludedUserIds.add(block.blockerId);
      excludedUserIds.add(block.blockedId);
    });

    // Also exclude the user's own ID
    excludedUserIds.add(req.user!.id);

    // Find potential matches
    const potentialMatches = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedUserIds) },
        basicInfo: {
          gender: { in: preferredGenders },
        },
      },
      include: {
        profile: true,
        basicInfo: true,
        casteInfo: true,
        occupationInfo: true,
        lifestyleInfo: true,
        personalityInfo: true,
      },
      take: parseInt(limit as string),
      skip: parseInt(skip as string),
    });

    // Calculate compatibility scores and filter by distance
    const matchesWithScores = potentialMatches.map((match) => {
      const matchLocation = match.basicInfo?.location as any;
      let distance = null;

      // Calculate distance if both locations have coordinates
      if (coordinates && matchLocation?.coordinates) {
        distance = getDistanceFromLatLng(
          coordinates.latitude,
          coordinates.longitude,
          matchLocation.coordinates.latitude,
          matchLocation.coordinates.longitude,
        );
      }

      // Calculate compatibility score
      const compatibilityScore = calculateCompatibilityScore(currentUser, match);

      return {
        id: match.id,
        displayName: match.profile?.displayName,
        profilePicture: match.profile?.profilePictureUrl,
        age: match.basicInfo?.birthDate
          ? Math.floor(
              (new Date().getTime() - new Date(match.basicInfo.birthDate).getTime()) / 3.15576e10,
            )
          : null,
        location: matchLocation
          ? {
              city: matchLocation.city,
              state: matchLocation.state,
              country: matchLocation.country,
            }
          : null,
        distance,
        occupation: match.occupationInfo?.occupation,
        religion: match.casteInfo?.religion,
        compatibility: compatibilityScore,
      };
    });

    // Sort by compatibility score
    matchesWithScores.sort((a, b) => (b.compatibility || 0) - (a.compatibility || 0));

    res.json(matchesWithScores);
  } catch (error) {
    logger.error('Error fetching potential matches:', error);
    res.status(500).json({ error: 'Failed to fetch potential matches' });
  }
};

// Get confirmed matches (mutual interest)
export const getConfirmedMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const confirmedMatches = await prisma.match.findMany({
      where: {
        OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
        status: 'ACCEPTED',
      },
      include: {
        sender: {
          include: {
            profile: true,
            basicInfo: true,
          },
        },
        receiver: {
          include: {
            profile: true,
            basicInfo: true,
          },
        },
        chatRoom: {
          include: {
            messages: {
              orderBy: {
                sentAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform data to return relevant info
    const matches = confirmedMatches.map((match) => {
      const otherUser = match.senderId === req.user!.id ? match.receiver : match.sender;
      return {
        matchId: match.id,
        userId: otherUser.id,
        displayName: otherUser.profile?.displayName,
        profilePicture: otherUser.profile?.profilePictureUrl,
        matchedOn: match.updatedAt,
        chatRoomId: match.chatRoomId,
        lastMessage: match.chatRoom?.messages[0]
          ? {
              content: match.chatRoom.messages[0].content,
              sentAt: match.chatRoom.messages[0].sentAt,
              isSentByMe: match.chatRoom.messages[0].senderId === req.user!.id,
            }
          : null,
      };
    });

    res.json(matches);
  } catch (error) {
    logger.error('Error fetching confirmed matches:', error);
    res.status(500).json({ error: 'Failed to fetch confirmed matches' });
  }
};

// Express interest in a user (create a match request)
export const expressInterest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { userId } = req.params;

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check for existing match
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          {
            senderId: req.user.id,
            receiverId: userId,
          },
          {
            senderId: userId,
            receiverId: req.user.id,
          },
        ],
      },
    });

    if (existingMatch) {
      if (existingMatch.senderId === req.user.id) {
        res.status(400).json({ error: 'You have already expressed interest in this user' });
        return;
      }

      // If the other user has already expressed interest, create a match
      if (existingMatch.receiverId === req.user.id) {
        const updatedMatch = await prisma.match.update({
          where: { id: existingMatch.id },
          data: { status: 'ACCEPTED' },
        });

        // Create a chat room for the match
        const chatRoom = await prisma.chatRoom.create({
          data: {
            participants: {
              create: [{ userId: req.user.id }, { userId: userId }],
            },
          },
        });

        // Update match with chat room
        await prisma.match.update({
          where: { id: updatedMatch.id },
          data: { chatRoomId: chatRoom.id },
        });

        // Create a notification for both users
        await prisma.notification.createMany({
          data: [
            {
              userId: req.user.id,
              type: 'MATCH',
              title: 'New Match!',
              message: `You have a new match!`,
              data: { matchId: updatedMatch.id, userId },
            },
            {
              userId,
              type: 'MATCH',
              title: 'New Match!',
              message: `You have a new match!`,
              data: { matchId: updatedMatch.id, userId: req.user.id },
            },
          ],
        });

        res.json({
          message: 'Match created successfully!',
          match: {
            id: updatedMatch.id,
            status: updatedMatch.status,
            chatRoomId: chatRoom.id,
          },
        });
        return;
      }
    }

    // Create a new match (interest)
    const match = await prisma.match.create({
      data: {
        senderId: req.user.id,
        receiverId: userId,
        status: 'PENDING',
      },
    });

    // Create a "like" record
    await prisma.like.create({
      data: {
        fromUserId: req.user.id,
        toUserId: userId,
      },
    });

    // Create a notification for the receiver
    await prisma.notification.create({
      data: {
        userId,
        type: 'LIKE',
        title: 'New Interest',
        message: 'Someone is interested in your profile!',
        data: { matchId: match.id },
      },
    });

    res.json({
      message: 'Interest expressed successfully',
      matchId: match.id,
    });
  } catch (error) {
    logger.error('Error expressing interest:', error);
    res.status(500).json({ error: 'Failed to express interest' });
  }
};

// Accept or reject a match
export const makeMatchDecision = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { matchId } = req.params;
    const { decision } = req.body;

    if (!decision || !['ACCEPTED', 'REJECTED'].includes(decision)) {
      res.status(400).json({ error: 'Invalid decision. Must be ACCEPTED or REJECTED' });
      return;
    }

    // Get the match and verify the current user is the receiver
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        receiverId: req.user.id,
        status: 'PENDING',
      },
    });

    if (!match) {
      res
        .status(404)
        .json({ error: 'Match not found or you are not authorized to make this decision' });
      return;
    }

    // Update the match status
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: { status: decision },
    });

    // If accepted, create a chat room
    if (decision === 'ACCEPTED') {
      const chatRoom = await prisma.chatRoom.create({
        data: {
          participants: {
            create: [{ userId: match.senderId }, { userId: match.receiverId }],
          },
        },
      });

      // Update match with chat room
      await prisma.match.update({
        where: { id: matchId },
        data: { chatRoomId: chatRoom.id },
      });

      // Create notifications for both users
      await prisma.notification.createMany({
        data: [
          {
            userId: match.senderId,
            type: 'MATCH',
            title: 'New Match!',
            message: `You have a new match!`,
            data: { matchId, userId: match.receiverId },
          },
          {
            userId: match.receiverId,
            type: 'MATCH',
            title: 'New Match!',
            message: `You have a new match!`,
            data: { matchId, userId: match.senderId },
          },
        ],
      });

      res.json({
        message: 'Match accepted successfully',
        match: {
          id: updatedMatch.id,
          status: updatedMatch.status,
          chatRoomId: chatRoom.id,
        },
      });
    } else {
      res.json({
        message: 'Match rejected successfully',
        matchId,
      });
    }
  } catch (error) {
    logger.error('Error making match decision:', error);
    res.status(500).json({ error: 'Failed to process match decision' });
  }
};

// Get details of a specific match
export const getMatchDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { matchId } = req.params;

    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      },
      include: {
        sender: {
          include: {
            profile: true,
            basicInfo: true,
            casteInfo: true,
            occupationInfo: true,
          },
        },
        receiver: {
          include: {
            profile: true,
            basicInfo: true,
            casteInfo: true,
            occupationInfo: true,
          },
        },
      },
    });

    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    // Determine which user is the other person
    const otherUser = match.senderId === req.user.id ? match.receiver : match.sender;

    res.json({
      matchId: match.id,
      status: match.status,
      matchedOn: match.createdAt,
      chatRoomId: match.chatRoomId,
      user: {
        id: otherUser.id,
        displayName: otherUser.profile?.displayName,
        profilePicture: otherUser.profile?.profilePictureUrl,
        basicInfo: otherUser.basicInfo,
        casteInfo: otherUser.casteInfo,
        occupationInfo: otherUser.occupationInfo,
      },
    });
  } catch (error) {
    logger.error('Error fetching match details:', error);
    res.status(500).json({ error: 'Failed to fetch match details' });
  }
};

// Get match statistics/summary
export const getMatchesSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Count total matches
    const totalMatches = await prisma.match.count({
      where: {
        OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
        status: 'ACCEPTED',
      },
    });

    // Count pending matches (where user is receiver)
    const pendingMatches = await prisma.match.count({
      where: {
        receiverId: req.user.id,
        status: 'PENDING',
      },
    });

    // Count sent interests (where user is sender)
    const sentInterests = await prisma.match.count({
      where: {
        senderId: req.user.id,
        status: 'PENDING',
      },
    });

    // Count rejected matches
    const rejectedMatches = await prisma.match.count({
      where: {
        OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
        status: 'REJECTED',
      },
    });

    res.json({
      totalMatches,
      pendingMatches,
      sentInterests,
      rejectedMatches,
    });
  } catch (error) {
    logger.error('Error fetching match summary:', error);
    res.status(500).json({ error: 'Failed to fetch match summary' });
  }
};
