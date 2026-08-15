// src/modules/notifications/dto/create-notification.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { NotificationType } from '../interfaces/notification-type.enum';

export class CreateNotificationDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ enum: NotificationType, default: NotificationType.SYSTEM })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({ example: 'New Appointment Scheduled' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'You have a new appointment scheduled for tomorrow at 10:00 AM' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({ required: false, example: '/appointments/123' })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}