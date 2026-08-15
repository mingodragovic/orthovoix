// src/modules/notifications/gateways/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { NotificationsService } from '../notifications.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients: Map<string, string[]> = new Map();

  constructor(
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  /**
   * Handle client connection
   */
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      const userId = payload.sub;
      
      if (!this.connectedClients.has(userId)) {
        this.connectedClients.set(userId, []);
      }
      const userSockets = this.connectedClients.get(userId);
      if (userSockets) {
        userSockets.push(client.id);
      }
      
      client.join(`user-${userId}`);
      
      this.logger.log(`Client ${client.id} connected for user ${userId}`);
      this.logger.log(`Total connections: ${this.connectedClients.size}`);

      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('unread-count', { count: unreadCount });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Connection error: ${errorMessage}`);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    for (const [userId, socketIds] of this.connectedClients.entries()) {
      const index = socketIds.indexOf(client.id);
      if (index !== -1) {
        socketIds.splice(index, 1);
        if (socketIds.length === 0) {
          this.connectedClients.delete(userId);
        }
        break;
      }
    }
    this.logger.log(`Client ${client.id} disconnected`);
    this.logger.log(`Total connections: ${this.connectedClients.size}`);
  }

  /**
   * Mark notification as read via WebSocket
   */
  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return { success: false, error: 'No token provided' };
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      const userId = payload.sub;

      await this.notificationsService.markAsRead(data.notificationId, userId);
      
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      
      this.server.to(`user-${userId}`).emit('unread-count', { count: unreadCount });
      this.server.to(`user-${userId}`).emit('notification-updated', { 
        notificationId: data.notificationId,
        read: true,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error marking notification as read: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Mark all notifications as read via WebSocket
   */
  @SubscribeMessage('mark-all-read')
  async handleMarkAllRead(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return { success: false, error: 'No token provided' };
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      const userId = payload.sub;

      await this.notificationsService.markAllAsRead(userId);
      
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      
      this.server.to(`user-${userId}`).emit('unread-count', { count: unreadCount });
      this.server.to(`user-${userId}`).emit('all-notifications-read');

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error marking all notifications as read: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get unread count via WebSocket
   */
  @SubscribeMessage('get-unread-count')
  async handleGetUnreadCount(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return { success: false, error: 'No token provided' };
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      const userId = payload.sub;

      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('unread-count', { count: unreadCount });

      return { success: true, count: unreadCount };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting unread count: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send notification to a specific user
   */
 sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user-${userId}`).emit('new-notification', notification);
    this.logger.log(`Notification sent to user ${userId}: ${notification.title}`);
    
    // Also update unread count
    this.updateUnreadCount(userId);
  }
  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  /**
   * Broadcast notification to all connected clients
   */
  broadcastNotification(notification: any) {
    this.server.emit('broadcast-notification', notification);
    this.logger.log(`Broadcast notification sent: ${notification.title}`);
  }

  /**
   * Update unread count for a user
   */
  updateUnreadCount(userId: string) {
    this.notificationsService.getUnreadCount(userId).then(count => {
      this.server.to(`user-${userId}`).emit('unread-count', { count });
    }).catch((error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error updating unread count: ${errorMessage}`);
    });
  }
}