import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { prisma } from '../config/database';
import logger from '../config/logger';
import { verifyAccessToken } from '../utils/jwt';

// User connection mapping
interface ConnectedUser {
  userId: string;
  socketId: string;
}

class SocketService {
  private io: Server;
  private connectedUsers: ConnectedUser[] = [];

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  // Middleware for authentication
  private setupMiddleware(): void {
    this.io.use(async (socket: Socket, next: any) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication error: Token missing'));
        }

        // Verify token
        try {
          const decoded = verifyAccessToken(token);
          if (!decoded || !decoded.userId) {
            return next(new Error('Authentication error: Invalid token'));
          }

          // Store user ID in socket data
          (socket as any).userId = decoded.userId;

          next();
        } catch (error) {
          return next(new Error('Authentication error: Invalid token'));
        }
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });
  }

  // Set up socket event handlers
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;

      logger.info(`User connected: ${userId}`);

      // Add user to connected users
      this.connectedUsers.push({
        userId,
        socketId: socket.id,
      });

      // Update user's online status
      this.updateUserStatus(userId, true);

      // Join personal room for direct messages
      socket.join(`user:${userId}`);

      // Add handler for get-user-info event (for test client)
      socket.on('get-user-info', () => {
        socket.emit('user-info', { userId });
        logger.info(`User info requested for ${userId}`);
      });

      // Handle joining chat rooms
      socket.on('join-chat', async (chatId: string) => {
        try {
          // Verify user is a participant in this chat
          const participant = await prisma.chatParticipant.findFirst({
            where: {
              chatRoomId: chatId,
              userId,
            },
          });

          if (participant) {
            socket.join(`chat:${chatId}`);
            logger.info(`User ${userId} joined chat ${chatId}`);
          }
        } catch (error) {
          logger.error(`Error joining chat ${chatId}:`, error);
        }
      });

      // Handle new messages
      socket.on('send-message', async (data: any) => {
        try {
          const { chatId, content, messageType = 'TEXT' } = data;

          // Verify user is a participant in this chat
          const participant = await prisma.chatParticipant.findFirst({
            where: {
              chatRoomId: chatId,
              userId,
            },
          });

          if (!participant) {
            socket.emit('error', { message: 'Not authorized to send messages to this chat' });
            return;
          }

          // Create the message in the database
          const message = await prisma.message.create({
            data: {
              chatRoomId: chatId,
              senderId: userId,
              content,
              messageType,
              status: 'SENT',
            },
            include: {
              sender: {
                include: {
                  profile: true,
                },
              },
            },
          });

          // Update chat's last activity
          await prisma.chatRoom.update({
            where: { id: chatId },
            data: { lastActivityAt: new Date() },
          });

          // Get sender's display name for the message
          const displayName = message.sender.profile?.displayName || 'User';
          const profilePicture = message.sender.profile?.profilePictureUrl;

          // Create read receipt for sender
          await prisma.messageReadReceipt.create({
            data: {
              messageId: message.id,
              userId,
            },
          });

          // Emit message to the chat room
          this.io.to(`chat:${chatId}`).emit('new-message', {
            id: message.id,
            chatId,
            content: message.content,
            messageType: message.messageType,
            sentAt: message.sentAt,
            sender: {
              id: userId,
              name: displayName,
              profilePicture,
            },
          });

          // Get other participants to send notifications
          const otherParticipants = await prisma.chatParticipant.findMany({
            where: {
              chatRoomId: chatId,
              userId: { not: userId },
            },
          });

          // Notify other participants
          for (const participant of otherParticipants) {
            // Create notification in database
            await prisma.notification.create({
              data: {
                userId: participant.userId,
                type: 'MESSAGE',
                title: 'New Message',
                message: `New message from ${displayName}`,
                data: {
                  chatId,
                  messageId: message.id,
                },
              },
            });

            // Send notification via socket if user is online
            this.io.to(`user:${participant.userId}`).emit('new-notification', {
              type: 'MESSAGE',
              title: 'New Message',
              message: `New message from ${displayName}`,
              data: {
                chatId,
                messageId: message.id,
              },
            });
          }
        } catch (error) {
          logger.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing', (chatId: string) => {
        socket.to(`chat:${chatId}`).emit('user-typing', {
          userId,
          chatId,
        });
      });

      // Handle reading messages
      socket.on('mark-read', async (data: any) => {
        try {
          const { chatId, messageIds } = data;

          if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return;
          }

          // Create read receipts one by one instead of using createMany
          for (const messageId of messageIds) {
            // Check if receipt already exists
            const existingReceipt = await prisma.messageReadReceipt.findFirst({
              where: {
                messageId,
                userId,
              },
            });

            // Create only if not exists
            if (!existingReceipt) {
              await prisma.messageReadReceipt.create({
                data: {
                  messageId,
                  userId,
                },
              });
            }
          }

          // Update participant's last read time
          await prisma.chatParticipant.updateMany({
            where: {
              chatRoomId: chatId,
              userId,
            },
            data: {
              lastReadAt: new Date(),
            },
          });

          // Notify other users in the chat about the read status
          socket.to(`chat:${chatId}`).emit('messages-read', {
            userId,
            chatId,
            messageIds,
          });
        } catch (error) {
          logger.error('Error marking messages as read:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${userId}`);

        // Remove user from connected users
        this.connectedUsers = this.connectedUsers.filter((user) => user.socketId !== socket.id);

        // Update user's online status
        this.updateUserStatus(userId, false);
      });
    });
  }

  // Update user's online status in the database
  private async updateUserStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { lastActive: new Date() },
      });
    } catch (error) {
      logger.error(`Error updating user status for ${userId}:`, error);
    }
  }

  // Check if a user is online
  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.some((user) => user.userId === userId);
  }

  // Get socket ID for a user
  public getUserSocketId(userId: string): string | null {
    const user = this.connectedUsers.find((user) => user.userId === userId);
    return user ? user.socketId : null;
  }

  // Send a private message to a specific user
  public sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Send a message to a chat room
  public sendToChat(chatId: string, event: string, data: any): void {
    this.io.to(`chat:${chatId}`).emit(event, data);
  }

  // Send a broadcast message to all connected users
  public broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }
}

export default SocketService;
