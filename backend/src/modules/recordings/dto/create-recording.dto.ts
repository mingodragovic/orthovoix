// src/modules/recordings/dto/create-recording.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUUID, Min, Max } from 'class-validator';

export class CreateRecordingDto {
  @ApiProperty({ example: 'http://localhost:9000/orthovoix/recordings/...' })
  @IsString()
  recordingUrl!: string;

  @ApiProperty({ example: 'recordings/patient123/exercise456/1700000000000.webm' })
  @IsString()
  recordingKey!: string;

  @ApiProperty({ example: 3.5 })
  @IsNumber()
  @Min(0.5)
  @Max(60)
  duration!: number;

  @ApiProperty({ required: false, example: 'First attempt, needs more practice' })
  @IsOptional()
  @IsString()
  notes?: string;
}