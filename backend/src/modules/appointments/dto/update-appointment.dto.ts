// src/modules/appointments/dto/update-appointment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus, AppointmentType } from '../interfaces/appointment-status.enum';

export class UpdateAppointmentDto {
  @ApiProperty({ required: false, example: '2024-01-15T10:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateTime?: Date;

  @ApiProperty({ required: false, example: 30, description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  duration?: number;

  @ApiProperty({ required: false, enum: AppointmentType })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @ApiProperty({ required: false, enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ required: false, example: 'Clinic Room 101' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false, example: 'https://meet.google.com/abc-defg-hij' })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isVirtual?: boolean;

  @ApiProperty({ required: false, example: 'Bring the worksheets from last session' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, example: 'Patient cancelled due to illness' })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}