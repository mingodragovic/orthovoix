// src/modules/notifications/gateways/simple-notifications.gateway.ts
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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'notifications',
})
export class SimpleNotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SimpleNotificationsGateway.name);
  private connectedClients: Map<string, Set<string>> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = 
        client.handshake.auth?.token || 
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} rejected: No token`);
        client.emit('error', { message: 'No token provided' });
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      const userId = payload.sub;

      if (!this.connectedClients.has(userId)) {
        this.connectedClients.set(userId, new Set());
      }
      this.connectedClients.get(userId)?.add(client.id);

      client.join(`user:${userId}`);
      client.data.userId = userId;

      this.logger.log(`✅ Client ${client.id} connected for user ${userId}`);
      this.logger.log(`📊 Total connections: ${this.getTotalConnections()}`);

      // Send welcome message
      client.emit('connected', { 
        message: 'Connected to notifications service',
        userId 
      });

      // Send unread count
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('unread-count', { count: unreadCount });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Connection error: ${errorMessage}`);
      client.emit('error', { message: errorMessage });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.connectedClients.has(userId)) {
      this.connectedClients.get(userId)?.delete(client.id);
      if (this.connectedClients.get(userId)?.size === 0) {
        this.connectedClients.delete(userId);
      }
    }
    this.logger.log(`❌ Client ${client.id} disconnected`);
  }

  @SubscribeMessage('get-unread-count')
  async handleGetUnreadCount(@ConnectedSocket() client: Socket) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('unread-count', { count: unreadCount });
      this.logger.log(`📊 Unread count for ${userId}: ${unreadCount}`);

      return { success: true, count: unreadCount };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting unread count: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      await this.notificationsService.markAsRead(data.notificationId, userId);
      
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      
      this.server.to(`user:${userId}`).emit('unread-count', { count: unreadCount });
      this.server.to(`user:${userId}`).emit('notification-updated', { 
        notificationId: data.notificationId,
        read: true,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  @SubscribeMessage('mark-all-read')
  async handleMarkAllRead(@ConnectedSocket() client: Socket) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      await this.notificationsService.markAllAsRead(userId);
      
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      
      this.server.to(`user:${userId}`).emit('unread-count', { count: unreadCount });
      this.server.to(`user:${userId}`).emit('all-notifications-read');

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send notification to a specific user - ADD LOGGING
   */
  sendNotificationToUser(userId: string, notification: any) {
    this.logger.log(`📨 Attempting to send notification to user ${userId}`);
    this.logger.log(`📨 Notification: ${notification.title}`);
    this.logger.log(`📨 Connected users: ${Array.from(this.connectedClients.keys())}`);
    
    const hasUser = this.connectedClients.has(userId);
    this.logger.log(`📨 User ${userId} is ${hasUser ? 'connected' : 'NOT connected'}`);
    
    if (hasUser) {
      const socketIds = this.connectedClients.get(userId);
      this.logger.log(`📨 User has ${socketIds?.size || 0} connections`);
    }

    this.server.to(`user:${userId}`).emit('new-notification', notification);
    this.logger.log(`📨 Notification event emitted to user:${userId}`);
    
    // Update unread count for the user
    this.updateUnreadCount(userId);
  }

  /**
   * Update unread count for a user
   */
  updateUnreadCount(userId: string) {
    this.notificationsService.getUnreadCount(userId).then(count => {
      this.logger.log(`📊 Updating unread count for ${userId}: ${count}`);
      this.server.to(`user:${userId}`).emit('unread-count', { count });
    }).catch((error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error updating unread count: ${errorMessage}`);
    });
  }

  private getTotalConnections(): number {
    let total = 0;
    for (const sockets of this.connectedClients.values()) {
      total += sockets.size;
    }
    return total;
  }
}