// src/modules/notifications/notifications.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations, LessThan } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationType } from './interfaces/notification-type.enum';
import { UsersService } from '../users/users.service';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { SimpleNotificationsGateway } from './gateways/simple-notifications.gateway';

@Injectable()
@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private usersService: UsersService,
    @Inject(forwardRef(() => SimpleNotificationsGateway))
    private notificationsGateway: SimpleNotificationsGateway,
  ) {}

  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    await this.usersService.findById(createNotificationDto.userId);

    const notification = this.notificationRepository.create({
      userId: createNotificationDto.userId,
      type: createNotificationDto.type || NotificationType.SYSTEM,
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      actionUrl: createNotificationDto.actionUrl,
      metadata: createNotificationDto.metadata,
      read: false,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Send real-time notification via WebSocket
    this.notificationsGateway.sendNotificationToUser(
      createNotificationDto.userId,
      this.toResponseDto(savedNotification),
    );

    return savedNotification;
  }

  /**
   * Create notifications for multiple users
   */
  async createBulkNotifications(
    userIds: string[],
    createNotificationDto: Omit<CreateNotificationDto, 'userId'>,
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const userId of userIds) {
      // Verify user exists
      await this.usersService.findById(userId);

      const notification = this.notificationRepository.create({
        userId,
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        actionUrl: createNotificationDto.actionUrl,
        metadata: createNotificationDto.metadata,
        read: false,
      });

      notifications.push(notification);
    }

    const savedNotifications = await this.notificationRepository.save(notifications);

    // Send real-time notifications via WebSocket
    savedNotifications.forEach(notification => {
      this.notificationsGateway.sendNotificationToUser(
        notification.userId,
        this.toResponseDto(notification),
      );
    });

    return savedNotifications;
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
    read?: boolean,
    type?: string,
  ): Promise<{ items: Notification[]; total: number; page: number; limit: number }> {
    // Verify user exists
    await this.usersService.findById(userId);

    const skip = (page - 1) * limit;
    const where: any = { userId };

    if (read !== undefined) {
      where.read = read;
    }

    if (type) {
      where.type = type;
    }

    const [items, total] = await this.notificationRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get unread notifications count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  /**
   * Get a single notification by ID
   */
  async findById(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    // Check if the notification belongs to the user
    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not have access to this notification');
    }

    return notification;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.findById(id, userId);

    if (!notification.read) {
      notification.read = true;
      notification.readAt = new Date();
      await this.notificationRepository.save(notification);

      // Update unread count via WebSocket
      this.notificationsGateway.updateUnreadCount(userId);
    }

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    // Verify user exists
    await this.usersService.findById(userId);

    await this.notificationRepository.update(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );

    // Update unread count via WebSocket
    this.notificationsGateway.updateUnreadCount(userId);
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string, userId: string): Promise<void> {
    const notification = await this.findById(id, userId);
    await this.notificationRepository.remove(notification);
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<void> {
    // Verify user exists
    await this.usersService.findById(userId);

    await this.notificationRepository.delete({ userId });
  }

  /**
   * Delete old notifications (older than X days)
   */
  async deleteOldNotifications(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.notificationRepository.delete({
      createdAt: LessThan(cutoffDate),
      read: true,
    });

    return result.affected || 0;
  }

  /**
   * Create appointment notification
   */
  async createAppointmentNotification(
    userId: string,
    appointmentId: string,
    title: string,
    message: string,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.APPOINTMENT,
      title,
      message,
      actionUrl: `/appointments/${appointmentId}`,
      metadata: { appointmentId },
    });
  }

  /**
   * Create exercise assignment notification
   */
  async createExerciseAssignmentNotification(
    userId: string,
    exerciseId: string,
    patientId: string,
    title: string,
    message: string,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.EXERCISE_ASSIGNED,
      title,
      message,
      actionUrl: `/patient-exercises?patient=${patientId}`,
      metadata: { exerciseId, patientId },
    });
  }

  /**
   * Create progress update notification
   */
  async createProgressUpdateNotification(
    userId: string,
    patientId: string,
    progressId: string,
    title: string,
    message: string,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.PROGRESS_UPDATED,
      title,
      message,
      actionUrl: `/progress/patient/${patientId}`,
      metadata: { patientId, progressId },
    });
  }

  /**
   * Transform to response DTO
   */
  toResponseDto(notification: Notification): NotificationResponseDto {
    const now = new Date();
    const diffMs = now.getTime() - notification.createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeAgo: string;
    if (diffMins < 1) {
      timeAgo = 'Just now';
    } else if (diffMins < 60) {
      timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      timeAgo = notification.createdAt.toLocaleDateString();
    }

    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      readAt: notification.readAt,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      timeAgo,
    };
  }
}