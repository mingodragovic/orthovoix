// src/modules/notifications/dto/notification-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../interfaces/notification-type.enum';

export class NotificationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: NotificationType })
  type!: NotificationType;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  read!: boolean;

  @ApiProperty({ required: false })
  readAt?: Date;

  @ApiProperty({ required: false })
  actionUrl?: string;

  @ApiProperty({ required: false })
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty()
  timeAgo!: string;
}