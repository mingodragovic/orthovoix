// src/modules/submissions/dto/update-submission.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SubmissionStatus } from '../interfaces/submission-status.enum';

export class UpdateSubmissionDto {
  @ApiProperty({ required: false, enum: SubmissionStatus })
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @ApiProperty({ required: false, example: 'Great work!' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, example: 'Review notes from therapist' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class UpdateSubmissionStatusDto {
  @ApiProperty({ enum: SubmissionStatus })
  @IsEnum(SubmissionStatus)
  status!: SubmissionStatus;

  @ApiProperty({ required: false, example: 'Review notes from therapist' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}