// src/modules/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { ResponseDto } from '../../common/dto/response.dto';
import { NotificationType } from './interfaces/notification-type.enum';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Create a new notification (Orthophoniste only)' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can create notifications' })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    const result = await this.notificationsService.createNotification(createNotificationDto);
    return new ResponseDto({
      statusCode: 201,
      message: 'Notification created successfully',
      data: this.notificationsService.toResponseDto(result),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'read', required: false, example: false })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Notifications retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/notifications' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/NotificationResponseDto' }
                },
                total: { type: 'number', example: 10 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 1 }
              }
            }
          }
        }
      ]
    }
  })
  async findAll(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('read') read?: string,
    @Query('type') type?: string,
  ) {
    let readBoolean: boolean | undefined;
    if (read !== undefined) {
      if (read === 'true' || read === 'false') {
        readBoolean = read === 'true';
      } else {
        readBoolean = undefined;
      }
    }

    const result = await this.notificationsService.getUserNotifications(
      req.user.id,
      page,
      limit,
      readBoolean,
      type,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Notifications retrieved successfully',
      data: {
        items: result.items.map(n => this.notificationsService.toResponseDto(n)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Unread count retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/notifications/unread-count' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                count: { type: 'number', example: 5 }
              }
            }
          }
        }
      ]
    }
  })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return new ResponseDto({
      statusCode: 200,
      message: 'Unread count retrieved successfully',
      data: { count },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const result = await this.notificationsService.findById(id, req.user.id);
    return new ResponseDto({
      statusCode: 200,
      message: 'Notification retrieved successfully',
      data: this.notificationsService.toResponseDto(result),
    });
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const result = await this.notificationsService.markAsRead(id, req.user.id);
    return new ResponseDto({
      statusCode: 200,
      message: 'Notification marked as read successfully',
      data: this.notificationsService.toResponseDto(result),
    });
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'All notifications marked as read successfully' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/notifications/read-all' }
      }
    }
  })
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return new ResponseDto({
      statusCode: 200,
      message: 'All notifications marked as read successfully',
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Notification deleted successfully' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/notifications/123' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.notificationsService.deleteNotification(id, req.user.id);
    return new ResponseDto({
      statusCode: 200,
      message: 'Notification deleted successfully',
    });
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all notifications for current user' })
  @ApiResponse({
    status: 200,
    description: 'All notifications deleted successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'All notifications deleted successfully' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/notifications' }
      }
    }
  })
  async deleteAll(@Request() req) {
    await this.notificationsService.deleteAllNotifications(req.user.id);
    return new ResponseDto({
      statusCode: 200,
      message: 'All notifications deleted successfully',
    });
  }
}