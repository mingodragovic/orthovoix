// src/modules/recordings/dto/update-recording-review.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { RecordingStatus } from '../interfaces/recording-status.enum';

export class UpdateRecordingReviewDto {
  @ApiProperty({ enum: RecordingStatus, example: RecordingStatus.REVIEWED })
  @IsEnum(RecordingStatus)
  status!: RecordingStatus;

  @ApiProperty({ required: false, example: 'Great effort! Try to make the /r/ sound softer.' })
  @IsOptional()
  @IsString()
  feedback?: string;
}