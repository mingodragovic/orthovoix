// src/modules/patient-exercises/dto/assign-exercise.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsDate,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PriorityLevel } from '../interfaces/patient-exercise-status.enum';

export class AssignExerciseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  exerciseId!: string;

  @ApiProperty({ required: false, example: '2024-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @ApiProperty({ enum: PriorityLevel, default: PriorityLevel.MEDIUM, example: 'high' })
  @IsOptional()
  @IsEnum(PriorityLevel)
  priority?: PriorityLevel;

  @ApiProperty({ required: false, example: 'Complete this exercise before the next session' })
  @IsOptional()
  @IsString()
  notes?: string;
}