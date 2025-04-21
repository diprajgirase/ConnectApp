import { Request, Response } from 'express';
import { prisma } from '../config/database';
import logger from '../config/logger';
import { MessageType } from '@prisma/client';

// Get list of user's chats
export const getChatList = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userChats = await prisma.chatParticipant.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        chatRoom: {
          include: {
            participants: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
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
        chatRoom: {
          lastActivityAt: 'desc',
        },
      },
    });

    // Format response
    const chats = userChats.map((chat) => {
      // Find the other user in the chat
      const otherParticipants = chat.chatRoom.participants.filter((p) => p.userId !== req.user!.id);

      const otherUser = otherParticipants.length > 0 ? otherParticipants[0].user : null;

      // Get last message if exists
      const lastMessage = chat.chatRoom.messages.length > 0 ? chat.chatRoom.messages[0] : null;

      // Count unread messages
      const unreadCount = 0; // This will be implemented with message read status in a subsequent step

      return {
        chatId: chat.chatRoomId,
        user: otherUser
          ? {
              id: otherUser.id,
              name: otherUser.profile?.displayName || 'User',
              profilePicture: otherUser.profile?.profilePictureUrl,
            }
          : null,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              sentAt: lastMessage.sentAt,
              sentByMe: lastMessage.senderId === req.user!.id,
              messageType: lastMessage.messageType,
            }
          : null,
        unreadCount,
        lastActivity: chat.chatRoom.lastActivityAt,
      };
    });

    res.json(chats);
  } catch (error) {
    logger.error('Error fetching chat list:', error);
    res.status(500).json({ error: 'Failed to fetch chat list' });
  }
};

// Get chat by ID
export const getChatById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { chatId } = req.params;

    // Check if user is a participant in this chat
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatRoomId: chatId,
        userId: req.user.id,
      },
    });

    if (!participant) {
      res.status(403).json({ error: 'You are not authorized to access this chat' });
      return;
    }

    const chat = await prisma.chatRoom.findUnique({
      where: {
        id: chatId,
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true,
                basicInfo: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    // Find the other participants
    const otherParticipants = chat.participants
      .filter((p) => p.userId !== req.user!.id)
      .map((p) => ({
        id: p.userId,
        name: p.user.profile?.displayName || 'User',
        profilePicture: p.user.profile?.profilePictureUrl,
        lastSeen: p.lastReadAt,
      }));

    res.json({
      chatId: chat.id,
      createdAt: chat.createdAt,
      participants: otherParticipants,
      isActive: chat.isActive,
    });
  } catch (error) {
    logger.error('Error fetching chat details:', error);
    res.status(500).json({ error: 'Failed to fetch chat details' });
  }
};

// Get chat message history
export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { chatId } = req.params;
    const { limit = '50', before } = req.query;

    // Check if user is a participant in this chat
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatRoomId: chatId,
        userId: req.user.id,
      },
    });

    if (!participant) {
      res.status(403).json({ error: 'You are not authorized to access this chat' });
      return;
    }

    // Build query
    let query: any = {
      where: {
        chatRoomId: chatId,
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: parseInt(limit as string),
    };

    // If 'before' parameter is provided, add it to the query
    if (before) {
      query.where.sentAt = {
        lt: new Date(before as string),
      };
    }

    const messages = await prisma.message.findMany(query);

    // Fetch additional data for all messages
    const senderIds = [...new Set(messages.map((msg) => msg.senderId))];
    const messageIds = messages.map((msg) => msg.id);

    // Get all users from these messages
    const users = await prisma.user.findMany({
      where: {
        id: { in: senderIds },
      },
      include: {
        profile: true,
      },
    });

    // Get read receipts
    const readReceipts = await prisma.messageReadReceipt.findMany({
      where: {
        messageId: { in: messageIds },
      },
    });

    // Get media
    const media = await prisma.media.findMany({
      where: {
        messageId: { in: messageIds },
      },
    });

    // Create lookup maps
    const userMap = users.reduce(
      (map, user) => {
        map[user.id] = user;
        return map;
      },
      {} as Record<string, any>,
    );

    const readReceiptMap = readReceipts.reduce(
      (map, receipt) => {
        if (!map[receipt.messageId]) {
          map[receipt.messageId] = [];
        }
        map[receipt.messageId].push(receipt);
        return map;
      },
      {} as Record<string, any[]>,
    );

    const mediaMap = media.reduce(
      (map, m) => {
        if (!map[m.messageId!]) {
          map[m.messageId!] = [];
        }
        map[m.messageId!].push(m);
        return map;
      },
      {} as Record<string, any[]>,
    );

    // Format messages for response
    const formattedMessages = messages.map((message) => {
      const sender = userMap[message.senderId];
      const msgReadReceipts = readReceiptMap[message.id] || [];
      const msgMedia = mediaMap[message.id] || [];

      return {
        id: message.id,
        content: message.content,
        messageType: message.messageType,
        sentAt: message.sentAt,
        sender: {
          id: message.senderId,
          name: sender?.profile?.displayName || 'User',
          profilePicture: sender?.profile?.profilePictureUrl,
        },
        isRead: msgReadReceipts.some((receipt) => receipt.userId !== message.senderId),
        media: msgMedia.map((m) => ({
          id: m.id,
          url: m.url,
          type: m.type,
          caption: m.caption,
        })),
      };
    });

    res.json({
      chatId,
      messages: formattedMessages.reverse(), // Reverse to get chronological order
      hasMore: messages.length === parseInt(limit as string),
    });
  } catch (error) {
    logger.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

// Send a message to a chat
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { chatId } = req.params;
    const { content, messageType = 'TEXT' } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    // Check if user is a participant in this chat
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatRoomId: chatId,
        userId: req.user.id,
      },
    });

    if (!participant) {
      res.status(403).json({ error: 'You are not authorized to send messages to this chat' });
      return;
    }

    // Check if the chat is active
    const chat = await prisma.chatRoom.findUnique({
      where: { id: chatId },
    });

    if (!chat || !chat.isActive) {
      res.status(400).json({ error: 'This chat is no longer active' });
      return;
    }

    // Get user profile for display name
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
      },
    });

    const displayName = user?.profile?.displayName || 'User';
    const profilePicture = user?.profile?.profilePictureUrl;

    // Create the message
    const message = await prisma.message.create({
      data: {
        chatRoomId: chatId,
        senderId: req.user.id,
        content,
        messageType: messageType as MessageType,
        status: 'SENT',
      },
    });

    // Update the chat's last activity
    await prisma.chatRoom.update({
      where: {
        id: chatId,
      },
      data: {
        lastActivityAt: new Date(),
      },
    });

    // Create read receipt for the sender
    await prisma.messageReadReceipt.create({
      data: {
        messageId: message.id,
        userId: req.user.id,
      },
    });

    // Get other participants for notifications
    const otherParticipants = await prisma.chatParticipant.findMany({
      where: {
        chatRoomId: chatId,
        userId: {
          not: req.user.id,
        },
      },
    });

    // Create notifications for other participants
    if (otherParticipants.length > 0) {
      await prisma.notification.createMany({
        data: otherParticipants.map((participant) => ({
          userId: participant.userId,
          type: 'MESSAGE',
          title: 'New Message',
          message: `You received a new message from ${displayName}`,
          data: {
            chatId,
            messageId: message.id,
          },
        })),
      });
    }

    res.json({
      id: message.id,
      content: message.content,
      messageType: message.messageType,
      sentAt: message.sentAt,
      status: message.status,
      sender: {
        id: req.user.id,
        name: displayName,
        profilePicture,
      },
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.user.id; // Store user ID to avoid undefined errors
    const { chatId } = req.params;
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      res.status(400).json({ error: 'Message IDs are required' });
      return;
    }

    // Check if user is a participant in this chat
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatRoomId: chatId,
        userId,
      },
    });

    if (!participant) {
      res.status(403).json({ error: 'You are not authorized to access this chat' });
      return;
    }

    // Update participant's last read time
    await prisma.chatParticipant.update({
      where: {
        id: participant.id,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    // Create read receipts for each message
    const existingReceipts = await prisma.messageReadReceipt.findMany({
      where: {
        messageId: { in: messageIds },
        userId,
      },
    });

    // Filter out message IDs that already have read receipts
    const existingMessageIds = existingReceipts.map((receipt) => receipt.messageId);
    const newMessageIds = messageIds.filter((id) => !existingMessageIds.includes(id));

    if (newMessageIds.length > 0) {
      // Create read receipts one by one to avoid skipDuplicates issue
      for (const messageId of newMessageIds) {
        await prisma.messageReadReceipt.create({
          data: {
            messageId,
            userId,
          },
        });
      }

      // Update message status to READ
      await prisma.message.updateMany({
        where: {
          id: { in: newMessageIds },
          status: 'SENT',
        },
        data: {
          status: 'READ',
        },
      });
    }

    res.json({ success: true, markedAsRead: newMessageIds.length });
  } catch (error) {
    logger.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};
