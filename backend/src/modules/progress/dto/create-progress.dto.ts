import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsDate,
  IsEnum,
  IsString,
  IsArray,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProgressType } from '../interfaces/progress-type.enum';

export class AssessmentScoresDto {
  @ApiProperty({ required: false, example: 85 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  pronunciationScore?: number;

  @ApiProperty({ required: false, example: 90 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vocabularyScore?: number;

  @ApiProperty({ required: false, example: 75 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  grammarScore?: number;

  @ApiProperty({ required: false, example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  comprehensionScore?: number;

  @ApiProperty({ required: false, example: 70 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  fluencyScore?: number;

  @ApiProperty({ required: false, example: 82 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  articulationScore?: number;

  @ApiProperty({ required: false, example: 78 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  phonologyScore?: number;

  @ApiProperty({ required: false, example: 85 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  languageScore?: number;

  @ApiProperty({ required: false, example: 75 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  socialCommunicationScore?: number;

  @ApiProperty({ required: false, example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore?: number;
}

export class GoalDto {
  @ApiProperty({ example: 'Improve pronunciation of /r/ sound' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: ['not-started', 'in-progress', 'achieved', 'abandoned'], default: 'not-started' })
  @IsString()
  status!: 'not-started' | 'in-progress' | 'achieved' | 'abandoned';

  @ApiProperty({ required: false, example: '2024-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  targetDate?: Date;

  @ApiProperty({ required: false, example: '2024-12-15T23:59:59.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  achievedDate?: Date;

  @ApiProperty({ required: false, example: 'Making good progress' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateProgressDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()  // Make it optional since it comes from URL
  @IsUUID()
  patientId?: string;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
  @IsDate()
  @Type(() => Date)
  recordDate!: Date;

  @ApiProperty({ enum: ProgressType, default: ProgressType.OVERALL })
  @IsEnum(ProgressType)
  type!: ProgressType;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AssessmentScoresDto)
  scores?: AssessmentScoresDto;

  @ApiProperty({ required: false, example: 'Patient showed significant improvement in pronunciation' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, example: ['Good articulation', 'Strong vocabulary'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths?: string[];

  @ApiProperty({ required: false, example: ['Grammar needs work', 'Fluency needs practice'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  areasForImprovement?: string[];

  @ApiProperty({ required: false, type: [GoalDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoalDto)
  nextGoals?: GoalDto[];

  @ApiProperty({ required: false, example: 'Increase therapy sessions to 3x per week' })
  @IsOptional()
  @IsString()
  therapyPlanAdjustments?: string;

  @ApiProperty({ required: false, example: '3x per week' })
  @IsOptional()
  @IsString()
  recommendedFrequency?: string;

  @ApiProperty({ required: false, example: 6 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  therapyDuration?: number;
}