// src/modules/appointments/dto/add-session-notes.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class AddSessionNotesDto {
  @ApiProperty({ example: 'Patient showed significant improvement in pronunciation' })
  @IsString()
  @IsNotEmpty()
  notes!: string;

  @ApiProperty({ required: false, example: 25, description: 'Actual duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @ApiProperty({ required: false, example: ['Pronunciation practice', 'Vocabulary review'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @ApiProperty({ required: false, example: 'Patient can now pronounce /r/ sound correctly 80% of the time' })
  @IsOptional()
  @IsString()
  progress?: string;

  @ApiProperty({ required: false, example: 'Continue practicing /r/ sound, introduce /s/ sound' })
  @IsOptional()
  @IsString()
  nextSteps?: string;
}