// src/modules/appointments/dto/create-appointment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsDate,
  IsEnum,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentType } from '../interfaces/appointment-status.enum';

export class CreateAppointmentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  @IsDate()
  @Type(() => Date)
  dateTime!: Date;

  @ApiProperty({ example: 30, description: 'Duration in minutes' })
  @IsNumber()
  @Min(5)
  @Max(120)
  duration!: number;

  @ApiProperty({ enum: AppointmentType, default: AppointmentType.THERAPY_SESSION })
  @IsEnum(AppointmentType)
  type!: AppointmentType;

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
}