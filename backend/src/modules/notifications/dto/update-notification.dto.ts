// src/modules/notifications/dto/update-notification.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  read!: boolean;
}