// src/modules/appointments/dto/appointment-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus, AppointmentType } from '../interfaces/appointment-status.enum';
import { SessionNote } from '../entities/appointment.entity';

export class AppointmentResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  patientId!: string;

  @ApiProperty({ example: 'Emma Martin' })
  patientName!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  orthophonisteId!: string;

  @ApiProperty({ example: 'Dr. Sarah' })
  orthophonisteName!: string;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  dateTime!: Date;

  @ApiProperty({ example: 30 })
  duration!: number;

  @ApiProperty({ enum: AppointmentType, example: AppointmentType.THERAPY_SESSION })
  type!: AppointmentType;

  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.SCHEDULED })
  status!: AppointmentStatus;

  @ApiProperty({ required: false, example: 'Focus on pronunciation practice' })
  notes?: string;

  @ApiProperty({ required: false, type: [Object] })
  sessionNotes?: SessionNote[];

  @ApiProperty({ required: false, example: 'Patient cancelled' })
  cancellationReason?: string;

  @ApiProperty({ required: false, example: 'Clinic Room 101' })
  location?: string;

  @ApiProperty({ required: false, example: 'https://meet.google.com/abc-defg-hij' })
  meetingLink?: string;

  @ApiProperty({ required: false, example: false })
  isVirtual?: boolean;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  updatedAt!: Date;
}