// src/modules/exercises/dto/update-exercise.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExerciseCategory, ExerciseDifficulty } from '../interfaces/exercise-category.enum';
import { SlideItemDto } from './create-exercise.dto';

export class UpdateExerciseDto {
  @ApiProperty({ required: false, example: 'Pronunciation Practice - /r/ Sound' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, example: 'Practice the /r/ sound with these tongue twisters' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, enum: ExerciseCategory, example: ExerciseCategory.PRONUNCIATION })
  @IsOptional()
  @IsEnum(ExerciseCategory)
  category?: ExerciseCategory;

  @ApiProperty({ required: false, enum: ExerciseDifficulty, example: ExerciseDifficulty.INTERMEDIATE })
  @IsOptional()
  @IsEnum(ExerciseDifficulty)
  difficulty?: ExerciseDifficulty;

  @ApiProperty({ required: false, example: 'Repeat each word 5 times: red, run, rest, etc.' })
  @IsOptional()
  @IsString()
  instructions?: string;

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

  @ApiProperty({ required: false, description: 'Video storage key' })
  @IsOptional()
  @IsString()
  videoKey?: string;

  @ApiProperty({
    required: false,
    description: 'Array of slides (name, image + audio pairs)',
    type: [SlideItemDto],
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

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}