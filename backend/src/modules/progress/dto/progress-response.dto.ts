// src/modules/progress/dto/progress-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ProgressType } from '../interfaces/progress-type.enum';
import type { AssessmentScores, Goal } from '../entities/progress.entity';

export class ProgressResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  patientId!: string;

  @ApiProperty()
  patientName!: string;

  @ApiProperty()
  recordedBy!: string;

  @ApiProperty()
  recorderName!: string;

  @ApiProperty()
  recordDate!: Date;

  @ApiProperty({ enum: ProgressType })
  type!: ProgressType;

  @ApiProperty({ required: false })
  scores?: AssessmentScores;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false, type: [String] })
  strengths?: string[];

  @ApiProperty({ required: false, type: [String] })
  areasForImprovement?: string[];

  @ApiProperty({ required: false, type: [Object] })
  nextGoals?: Goal[];

  @ApiProperty({ required: false })
  therapyPlanAdjustments?: string;

  @ApiProperty({ required: false })
  recommendedFrequency?: string;

  @ApiProperty({ required: false })
  therapyDuration?: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}