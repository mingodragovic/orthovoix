// src/modules/patient-exercises/dto/update-progress.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PerformanceDto {
  @ApiProperty({ required: false, example: 85 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiProperty({ required: false, example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeTaken?: number;

  @ApiProperty({ required: false, example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  attempts?: number;

  @ApiProperty({ required: false, example: 'Good progress, keep practicing the /r/ sound' })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class ProgressLogDto {
  @ApiProperty({ example: 'Patient completed the exercise with 85% accuracy' })
  @IsString()
  notes!: string;

  @ApiProperty({ required: false, example: 85 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;
}

export class UpdateProgressDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PerformanceDto)
  performance?: PerformanceDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProgressLogDto)
  progressLog?: ProgressLogDto;
}