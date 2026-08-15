// src/modules/recordings/dto/recording-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { RecordingStatus } from '../interfaces/recording-status.enum';

export class RecordingResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  patientExerciseId!: string;

  @ApiProperty()
  recordingUrl!: string;

  @ApiProperty()
  recordingKey!: string;

  @ApiProperty()
  duration!: number;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ enum: RecordingStatus })
  status!: RecordingStatus;

  @ApiProperty({ required: false })
  feedback?: string;

  @ApiProperty({ required: false })
  reviewedAt?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  // ✅ NEW: Additional fields for admin dashboard
  @ApiProperty({ description: 'Full name of the patient' })
  patientName!: string;

  @ApiProperty({ description: 'Title of the exercise' })
  exerciseTitle!: string;

  @ApiProperty({ description: 'Patient ID' })
  patientId!: string | null;

  @ApiProperty({ description: 'Exercise ID' })
  exerciseId!: string | null;
}