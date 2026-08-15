// src/modules/patient-exercises/dto/update-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PatientExerciseStatus } from '../interfaces/patient-exercise-status.enum';

export class UpdateStatusDto {
  @ApiProperty({ enum: PatientExerciseStatus })
  @IsEnum(PatientExerciseStatus)
  status!: PatientExerciseStatus;

  @ApiProperty({ required: false, example: 'Patient completed the exercise with some assistance' })
  @IsOptional()
  @IsString()
  notes?: string;
}