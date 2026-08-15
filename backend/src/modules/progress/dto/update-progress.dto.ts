// src/modules/progress/dto/update-progress.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsDate,
  IsEnum,
  IsString,
  IsArray,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProgressType } from '../interfaces/progress-type.enum';
import { AssessmentScoresDto, GoalDto } from './create-progress.dto';

export class UpdateProgressDto {
  @ApiProperty({ required: false, example: '2024-01-15T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  recordDate?: Date;

  @ApiProperty({ required: false, enum: ProgressType })
  @IsOptional()
  @IsEnum(ProgressType)
  type?: ProgressType;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AssessmentScoresDto)
  scores?: AssessmentScoresDto;

  @ApiProperty({ required: false, example: 'Patient showed significant improvement' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, example: ['Good articulation'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths?: string[];

  @ApiProperty({ required: false, example: ['Grammar needs work'] })
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