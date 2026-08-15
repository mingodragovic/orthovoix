// src/modules/exercises/dto/create-exercise.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
  IsBoolean,
  ValidateNested,
  IsInt,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExerciseCategory, ExerciseDifficulty } from '../interfaces/exercise-category.enum';

export class SlideItemDto {
  @ApiProperty({ 
    required: false, 
    description: 'Display name for the slide (e.g., "tomato")',
    example: 'tomato'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Storage key for the image (use when creating with existing files)' 
  })
  @IsOptional()
  @IsString()
  imageKey?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Storage key for the audio (use when creating with existing files)' 
  })
  @IsOptional()
  @IsString()
  audioKey?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Index of the image file in the uploaded files array (use with multipart upload)',
    example: 0 
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  imageIndex?: number;

  @ApiProperty({ 
    required: false, 
    description: 'Index of the audio file in the uploaded files array (use with multipart upload)',
    example: 1 
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  audioIndex?: number;

  @ApiProperty({ 
    required: false, 
    description: 'Slide order/index in the exercise',
    example: 0 
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class CreateExerciseDto {
  @ApiProperty({ example: 'Pronunciation Practice - /r/ Sound' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Practice the /r/ sound with these tongue twisters' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: ExerciseCategory, example: ExerciseCategory.PRONUNCIATION })
  @IsEnum(ExerciseCategory)
  category!: ExerciseCategory;

  @ApiProperty({ enum: ExerciseDifficulty, example: ExerciseDifficulty.INTERMEDIATE })
  @IsEnum(ExerciseDifficulty)
  difficulty!: ExerciseDifficulty;

  @ApiProperty({ example: 'Repeat each word 5 times: red, run, rest, etc.' })
  @IsString()
  @IsNotEmpty()
  instructions!: string;

  @ApiProperty({ required: false, example: ['Flashcards', 'Audio recording device'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @ApiProperty({ required: false, example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  duration?: number;

  @ApiProperty({ 
    required: false, 
    description: 'Cover image storage key (thumbnail for exercise card)' 
  })
  @IsOptional()
  @IsString()
  coverImageKey?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Index of the cover image file in the uploaded files array (use with multipart upload)',
    example: 0 
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  coverImageIndex?: number;

  @ApiProperty({ required: false, description: 'Video storage key' })
  @IsOptional()
  @IsString()
  videoKey?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Index of the video file in the uploaded files array (use with multipart upload)',
    example: 4 
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  videoIndex?: number;

  @ApiProperty({
    required: false,
    description: 'Array of slides (name, image + audio pairs) - Can be JSON string or array',
    type: 'array',
    items: { $ref: '#/components/schemas/SlideItemDto' },
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlideItemDto)
  slides?: SlideItemDto[];

  @ApiProperty({ required: false, example: ['pronunciation', 'r-sound'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}