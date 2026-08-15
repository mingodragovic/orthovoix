// src/modules/submissions/dto/submission-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { SubmissionStatus } from '../interfaces/submission-status.enum';

export class RecordingAnswerResponseDto {
  @ApiProperty()
  slideIndex!: number;

  @ApiProperty({ required: false, description: 'Display name of the slide from the exercise' })
  slideName?: string;  // ✅ NEW: Slide name from exercise

  @ApiProperty()
  recordedAudioKey!: string;

  @ApiProperty({ required: false })
  recordedAudioUrl?: string;

  @ApiProperty({ required: false })
  duration?: number;

  @ApiProperty({ required: false })
  notes?: string;
}

export class SubmissionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  patientExerciseId!: string;

  @ApiProperty()
  patientId!: string;

  @ApiProperty()
  patientName!: string;

  @ApiProperty()
  exerciseId!: string;

  @ApiProperty()
  exerciseTitle!: string;

  @ApiProperty()
  submittedBy!: string;

  @ApiProperty()
  submitterName!: string;

  @ApiProperty({ type: [RecordingAnswerResponseDto] })
  answers!: RecordingAnswerResponseDto[];

  @ApiProperty({ required: false })
  metadata?: {
    deviceInfo?: string;
    browserInfo?: string;
    ipAddress?: string;
    submittedAt: Date;
  };

  @ApiProperty({ enum: SubmissionStatus })
  status!: SubmissionStatus;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  submittedAt!: Date;

  @ApiProperty({ required: false })
  reviewedAt?: Date;

  @ApiProperty({ required: false })
  reviewedBy?: string;

  @ApiProperty({ required: false })
  reviewerName?: string;

  @ApiProperty({ required: false })
  reviewNotes?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}