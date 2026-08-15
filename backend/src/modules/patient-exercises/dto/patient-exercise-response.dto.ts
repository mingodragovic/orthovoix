// src/modules/patient-exercises/dto/patient-exercise-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PatientExerciseStatus, PriorityLevel } from '../interfaces/patient-exercise-status.enum';

export class PatientExerciseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  patientId!: string;

  @ApiProperty()
  patientName!: string;

  @ApiProperty()
  exerciseId!: string;

  @ApiProperty()
  exerciseTitle!: string;

  @ApiProperty()
  exerciseCategory!: string;

  @ApiProperty({ required: false, description: 'Cover image URL for the exercise card' })
  coverImageUrl?: string;

  @ApiProperty()
  assignedBy!: string;

  @ApiProperty()
  assignerName!: string;

  @ApiProperty()
  assignedDate!: Date;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty({ required: false })
  completedDate?: Date;

  @ApiProperty({ enum: PatientExerciseStatus })
  status!: PatientExerciseStatus;

  @ApiProperty({ enum: PriorityLevel })
  priority!: PriorityLevel;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  performance?: {
    score?: number;
    timeTaken?: number;
    attempts?: number;
    feedback?: string;
  };

  @ApiProperty({ required: false, type: [Object] })
  progressLogs?: Array<{
    date: Date;
    status: string;
    notes: string;
    score?: number;
  }>;

  @ApiProperty()
  daysSinceAssigned!: number;

  @ApiProperty({ required: false })
  daysUntilDue?: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}