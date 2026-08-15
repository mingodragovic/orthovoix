// src/modules/submissions/dto/create-submission.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsObject,
  IsNotEmpty,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RecordingAnswerDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  slideIndex!: number;

  @ApiProperty({ example: 'recordings/patient123/exercise456/timestamp.webm' })
  @IsString()
  @IsNotEmpty()
  recordedAudioKey!: string;

  @ApiProperty({ required: false, example: 3.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10, { message: 'Recording duration cannot exceed 10 seconds' })
  duration?: number;

  @ApiProperty({ required: false, example: 'Good effort!' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SubmissionMetadataDto {
  @ApiProperty({ required: false, example: 'Mozilla/5.0...' })
  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @ApiProperty({ required: false, example: 'Chrome 120' })
  @IsOptional()
  @IsString()
  browserInfo?: string;

  @ApiProperty({ required: false, example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class CreateSubmissionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  patientExerciseId!: string;

  @ApiProperty({ 
    type: [RecordingAnswerDto],
    description: 'Array of answers, one per slide in the exercise. All slides must have an answer.',
    example: [
      { slideIndex: 0, recordedAudioKey: 'recordings/.../slide0.webm', duration: 3.5 },
      { slideIndex: 1, recordedAudioKey: 'recordings/.../slide1.webm', duration: 4.2 }
    ]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one answer is required' })
  @ValidateNested({ each: true })
  @Type(() => RecordingAnswerDto)
  answers!: RecordingAnswerDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SubmissionMetadataDto)
  metadata?: SubmissionMetadataDto;

  @ApiProperty({ required: false, example: 'Completed all exercises' })
  @IsOptional()
  @IsString()
  notes?: string;
}