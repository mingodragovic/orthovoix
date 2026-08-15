// src/modules/exercises/exercises.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Exercise, SlideItem } from './entities/exercise.entity';
import { CreateExerciseDto, SlideItemDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseResponseDto, SlideResponseDto } from './dto/exercise-response.dto';
import { ExerciseCategory } from './interfaces/exercise-category.enum';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private usersService: UsersService,
    private storageService: StorageService,
  ) {}

  /**
   * Create a new exercise
   */
  async create(createExerciseDto: CreateExerciseDto, currentUserId: string): Promise<Exercise> {
    const user = await this.usersService.findById(currentUserId);
    if (user.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can create exercises');
    }

    const exercise = this.exerciseRepository.create({
      ...createExerciseDto,
      createdBy: currentUserId,
    });

    return this.exerciseRepository.save(exercise);
  }

  /**
   * Create exercise with media keys (cover image, video, slides)
   */
  async createWithMedia(
    createExerciseDto: CreateExerciseDto,
    currentUserId: string,
    mediaKeys: { coverImageKey?: string; videoKey?: string; slides?: SlideItemDto[] },
  ): Promise<Exercise> {
    const user = await this.usersService.findById(currentUserId);
    if (user.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can create exercises');
    }

    const exercise = this.exerciseRepository.create({
      ...createExerciseDto,
      coverImageKey: mediaKeys.coverImageKey,
      videoKey: mediaKeys.videoKey,
      slides: mediaKeys.slides,
      createdBy: currentUserId,
    });

    return this.exerciseRepository.save(exercise);
  }

  /**
   * Get all exercises with pagination and filters
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    category?: string,
    difficulty?: string,
    search?: string,
    isActive?: boolean,
  ): Promise<{ items: Exercise[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Exercise> = {};

    if (category) {
      where.category = category as any;
    }

    if (difficulty) {
      where.difficulty = difficulty as any;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    let queryBuilder = this.exerciseRepository
      .createQueryBuilder('exercise')
      .leftJoinAndSelect('exercise.creator', 'creator');

    if (search) {
      queryBuilder = queryBuilder.where(
        'exercise.title ILIKE :search OR exercise.description ILIKE :search OR exercise.tags::text ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (category) {
      queryBuilder = queryBuilder.andWhere('exercise.category = :category', { category });
    }

    if (difficulty) {
      queryBuilder = queryBuilder.andWhere('exercise.difficulty = :difficulty', { difficulty });
    }

    if (isActive !== undefined) {
      queryBuilder = queryBuilder.andWhere('exercise.isActive = :isActive', { isActive });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('exercise.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single exercise by ID
   */
  async findById(id: string): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id },
      relations: { creator: true },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    return exercise;
  }

  /**
   * Update an exercise
   */
  async update(
    id: string,
    updateExerciseDto: UpdateExerciseDto,
    currentUserId: string,
  ): Promise<Exercise> {
    const exercise = await this.findById(id);

    const user = await this.usersService.findById(currentUserId);
    if (user.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can update exercises');
    }

    // Remove undefined values
    Object.keys(updateExerciseDto).forEach((key) => {
      if (updateExerciseDto[key as keyof UpdateExerciseDto] === undefined) {
        delete updateExerciseDto[key as keyof UpdateExerciseDto];
      }
    });

    Object.assign(exercise, updateExerciseDto);
    return this.exerciseRepository.save(exercise);
  }

  /**
   * Delete an exercise (soft delete by setting isActive to false)
   */
  async delete(id: string, currentUserId: string): Promise<void> {
    const exercise = await this.findById(id);

    const user = await this.usersService.findById(currentUserId);
    if (user.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can delete exercises');
    }

    exercise.isActive = false;
    await this.exerciseRepository.save(exercise);
  }

  /**
   * Get all exercise categories
   */
  async getCategories(): Promise<{ categories: string[] }> {
    const categories = Object.values(ExerciseCategory);
    return { categories };
  }

  /**
   * Search exercises
   */
  async search(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: Exercise[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.exerciseRepository
      .createQueryBuilder('exercise')
      .leftJoinAndSelect('exercise.creator', 'creator')
      .where('exercise.title ILIKE :query', { query: `%${query}%` })
      .orWhere('exercise.description ILIKE :query', { query: `%${query}%` })
      .orWhere('exercise.tags::text ILIKE :query', { query: `%${query}%` })
      .andWhere('exercise.isActive = :isActive', { isActive: true })
      .skip(skip)
      .take(limit)
      .orderBy('exercise.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Transform exercise to response DTO with fresh presigned URLs
   */
  async toResponseDto(exercise: Exercise): Promise<ExerciseResponseDto> {
    let coverImageUrl: string | undefined;
    let videoUrl: string | undefined;

    // Generate fresh presigned URL for cover image (1 hour expiration)
    if (exercise.coverImageKey) {
      try {
        coverImageUrl = await this.storageService.getFileUrl(exercise.coverImageKey, 3600);
      } catch (error) {
        // If file not found, leave as undefined
      }
    }

    // Generate fresh presigned URL for video (1 hour expiration)
    if (exercise.videoKey) {
      try {
        videoUrl = await this.storageService.getFileUrl(exercise.videoKey, 3600);
      } catch (error) {
        // If file not found, leave as undefined
      }
    }

    // Process slides - generate URLs for each slide's image and audio
    let slidesWithUrls: SlideResponseDto[] | undefined;
    if (exercise.slides && exercise.slides.length > 0) {
      slidesWithUrls = await Promise.all(
        exercise.slides.map(async (slide) => {
          const slideWithUrls: SlideResponseDto = {
            name: slide.name,
            order: slide.order,
            imageKey: slide.imageKey,
            audioKey: slide.audioKey,
          };

          // Generate image URL if key exists
          if (slide.imageKey) {
            try {
              slideWithUrls.imageUrl = await this.storageService.getFileUrl(slide.imageKey, 3600);
            } catch (error) {
              // If file not found, leave undefined
            }
          }

          // Generate audio URL if key exists
          if (slide.audioKey) {
            try {
              slideWithUrls.audioUrl = await this.storageService.getFileUrl(slide.audioKey, 3600);
            } catch (error) {
              // If file not found, leave undefined
            }
          }

          return slideWithUrls;
        }),
      );

      // Sort by order
      slidesWithUrls.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return {
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      category: exercise.category,
      difficulty: exercise.difficulty,
      instructions: exercise.instructions,
      materials: exercise.materials,
      duration: exercise.duration,
      coverImageUrl,
      coverImageKey: exercise.coverImageKey,
      videoUrl,
      videoKey: exercise.videoKey,
      slides: slidesWithUrls,
      tags: exercise.tags,
      isActive: exercise.isActive,
      createdBy: exercise.createdBy,
      creatorName: exercise.creator?.name || 'Unknown',
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    };
  }

  /**
   * Count exercises by category
   */
  async countByCategory(): Promise<{ category: string; count: number }[]> {
    const result = await this.exerciseRepository
      .createQueryBuilder('exercise')
      .select('exercise.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('exercise.isActive = :isActive', { isActive: true })
      .groupBy('exercise.category')
      .getRawMany();

    return result.map((item) => ({
      category: item.category,
      count: parseInt(item.count, 10),
    }));
  }
}