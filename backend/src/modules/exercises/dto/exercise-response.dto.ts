// src/modules/exercises/dto/exercise-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ExerciseCategory, ExerciseDifficulty } from '../interfaces/exercise-category.enum';

export class SlideResponseDto {
  @ApiProperty({ required: false, description: 'Display name for the slide' })
  name?: string;

  @ApiProperty({ required: false })
  imageUrl?: string;

  @ApiProperty({ required: false })
  imageKey?: string;

  @ApiProperty({ required: false })
  audioUrl?: string;

  @ApiProperty({ required: false })
  audioKey?: string;

  @ApiProperty({ required: false })
  order?: number;
}

export class ExerciseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ enum: ExerciseCategory })
  category!: ExerciseCategory;

  @ApiProperty({ enum: ExerciseDifficulty })
  difficulty!: ExerciseDifficulty;

  @ApiProperty()
  instructions!: string;

  @ApiProperty({ required: false, type: [String] })
  materials?: string[];

  @ApiProperty({ required: false })
  duration?: number;

  // Cover image (thumbnail for exercise card)
  @ApiProperty({ required: false })
  coverImageUrl?: string;

  @ApiProperty({ required: false })
  coverImageKey?: string;

  // Single video
  @ApiProperty({ required: false })
  videoUrl?: string;

  @ApiProperty({ required: false })
  videoKey?: string;

  // Array of slides
  @ApiProperty({ required: false, type: [SlideResponseDto] })
  slides?: SlideResponseDto[];

  @ApiProperty({ required: false, type: [String] })
  tags?: string[];

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdBy!: string;

  @ApiProperty()
  creatorName!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}