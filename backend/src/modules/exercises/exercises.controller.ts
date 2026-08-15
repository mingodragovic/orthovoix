// src/modules/exercises/exercises.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  ParseBoolPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto, SlideItemDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseResponseDto } from './dto/exercise-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { ResponseDto } from '../../common/dto/response.dto';
import { StorageService } from '../storage/storage.service';
import { ExerciseCategory } from './interfaces/exercise-category.enum';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

// Define Multer file type
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('exercises')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exercises')
export class ExercisesController {
  constructor(
    private readonly exercisesService: ExercisesService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Create a new exercise (JSON only)
   */
  @Post()
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Create a new exercise (Orthophoniste only)' })
  @ApiCreatedResponse({
    description: 'Exercise created successfully',
    type: ExerciseResponseDto,
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Only orthophonistes can create exercises' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation failed' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async create(@Body() createExerciseDto: CreateExerciseDto, @Request() req) {
    const exercise = await this.exercisesService.create(createExerciseDto, req.user.id);
    const responseDto = await this.exercisesService.toResponseDto(exercise);
    return new ResponseDto({
      statusCode: HttpStatus.CREATED,
      message: 'Exercise created successfully',
      data: responseDto,
    });
  }

  /**
   * Create exercise with media files (cover image, images, audio, video)
   * Supports multipart/form-data upload
   * Accepts slides as JSON string OR array
   */
  @Post('with-media')
  @Roles(UserRole.ORTHOPHONISTE)
  @UseInterceptors(FilesInterceptor('files', 20))
  @ApiOperation({
    summary: 'Create exercise with media files (cover image, images, audio, video)',
    description: 'Upload multiple files with metadata. Use slides JSON to map files to slides. Accepts slides as JSON string OR array.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Exercise data with file uploads',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Pronunciation Practice - /r/ Sound' },
        description: { type: 'string', example: 'Practice the /r/ sound with visual aids' },
        category: { type: 'string', enum: Object.values(ExerciseCategory), example: 'pronunciation' },
        difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'intermediate' },
        instructions: { type: 'string', example: 'Repeat each word 5 times' },
        materials: {
          type: 'string',
          description: 'JSON array of strings',
          example: '["Flashcards", "Audio recording device"]'
        },
        duration: { type: 'number', example: 15 },
        tags: {
          type: 'string',
          description: 'JSON array of strings',
          example: '["pronunciation", "r-sound"]'
        },
        isActive: { type: 'boolean', example: true },
        coverImageIndex: {
          type: 'number',
          description: 'Index of the cover image in the files array (optional)',
          example: 0
        },
        videoIndex: {
          type: 'number',
          description: 'Index of video file in the files array (optional)',
          example: 4
        },
        slides: {
          type: 'string',
          description: 'JSON array of slide objects with name, imageIndex and audioIndex referencing the files array',
          example: '[{"name":"tomato","imageIndex":1,"audioIndex":2,"order":0},{"name":"potato","imageIndex":3,"audioIndex":4,"order":1}]'
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Uploaded files (cover image, images, audio, video) in the order referenced by indexes'
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Exercise created successfully with media',
    type: ExerciseResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid slides JSON format or file mapping' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Only orthophonistes can create exercises' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async createWithMedia(
    @UploadedFiles() files: MulterFile[],
    @Body() body: any,
    @Request() req,
  ) {
    console.log('📁 Files received:', files?.length || 0);
    console.log('📝 Body received:', JSON.stringify(body, null, 2));

    // PARSE SLIDES: Accept JSON string OR array
    let slides: SlideItemDto[] = [];
    if (body.slides) {
      try {
        if (typeof body.slides === 'string') {
          const parsed = JSON.parse(body.slides);
          slides = Array.isArray(parsed) ? parsed : [parsed];
        } else if (Array.isArray(body.slides)) {
          slides = body.slides;
        } else if (typeof body.slides === 'object') {
          slides = [body.slides];
        }
        console.log('📊 Slides parsed:', slides.length);
        console.log('📊 Slides content:', JSON.stringify(slides, null, 2));
      } catch (error) {
        throw new BadRequestException(
          'Invalid slides format. Please provide a valid JSON array or string.\n' +
          'Expected: [{"name":"tomato","imageIndex":1,"audioIndex":2,"order":0}]'
        );
      }
    }

    // Parse materials from JSON string
    let materials: string[] = [];
    if (body.materials) {
      try {
        materials = typeof body.materials === 'string' ? JSON.parse(body.materials) : body.materials;
      } catch (error) {
        throw new BadRequestException('Invalid materials JSON format.');
      }
    }

    // Parse tags from JSON string
    let tags: string[] = [];
    if (body.tags) {
      try {
        tags = typeof body.tags === 'string' ? JSON.parse(body.tags) : body.tags;
      } catch (error) {
        throw new BadRequestException('Invalid tags JSON format.');
      }
    }

    const exerciseData: CreateExerciseDto = {
      title: body.title || 'Untitled Exercise',
      description: body.description || '',
      category: body.category || ExerciseCategory.OTHER,
      difficulty: body.difficulty || 'beginner',
      instructions: body.instructions || '',
      materials: materials,
      duration: body.duration ? parseInt(body.duration) : undefined,
      tags: tags,
      isActive: body.isActive === 'true' || body.isActive === true || body.isActive === '1',
    };

    let coverImageKey: string | undefined;
    let videoKey: string | undefined;
    const uploadedFiles = files || [];

    // Handle cover image
    const coverImageIndex = body.coverImageIndex !== undefined ? parseInt(body.coverImageIndex) : -1;
    if (coverImageIndex >= 0 && uploadedFiles[coverImageIndex]) {
      console.log('🖼️ Uploading cover image...');
      const file = uploadedFiles[coverImageIndex];
      const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!imageMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid cover image file type. Supported: jpeg, png, gif, webp, svg');
      }
      const maxImageSize = 5 * 1024 * 1024;
      if (file.size > maxImageSize) {
        throw new BadRequestException('Cover image file size exceeds 5MB limit.');
      }
      const result = await this.storageService.uploadFile(file, 'exercises/covers');
      coverImageKey = result.key;
      console.log('✅ Cover image key:', coverImageKey);
    } else if (body.coverImageKey) {
      coverImageKey = body.coverImageKey;
      console.log('✅ Using existing cover image key:', coverImageKey);
    }

    // Handle video file
    const videoIndex = body.videoIndex !== undefined ? parseInt(body.videoIndex) : -1;
    if (videoIndex >= 0 && uploadedFiles[videoIndex]) {
      console.log('🎬 Uploading video file...');
      const file = uploadedFiles[videoIndex];
      const videoMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!videoMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid video file type. Supported: mp4, webm, ogg, quicktime');
      }
      const maxVideoSize = 50 * 1024 * 1024;
      if (file.size > maxVideoSize) {
        throw new BadRequestException('Video file size exceeds 50MB limit.');
      }
      const result = await this.storageService.uploadFile(file, 'exercises/videos');
      videoKey = result.key;
      console.log('✅ Video key:', videoKey);
    } else if (body.videoKey) {
      videoKey = body.videoKey;
      console.log('✅ Using existing video key:', videoKey);
    }

    // Handle slides
    const processedSlides: SlideItemDto[] = [];
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const processedSlide: SlideItemDto = {
        name: slide.name || `Slide ${i + 1}`,
        order: slide.order !== undefined ? slide.order : i,
      };

      if (slide.imageIndex !== undefined && uploadedFiles[slide.imageIndex]) {
        const file = uploadedFiles[slide.imageIndex];
        const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!imageMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(`Invalid image file type for slide ${i}. Supported: jpeg, png, gif, webp, svg`);
        }
        const maxImageSize = 5 * 1024 * 1024;
        if (file.size > maxImageSize) {
          throw new BadRequestException(`Image file size for slide ${i} exceeds 5MB limit.`);
        }
        const result = await this.storageService.uploadFile(file, 'exercises/images');
        processedSlide.imageKey = result.key;
        console.log(`✅ Slide ${i} image uploaded:`, processedSlide.imageKey);
      } else if (slide.imageKey) {
        processedSlide.imageKey = slide.imageKey;
        console.log(`✅ Slide ${i} using existing image key:`, processedSlide.imageKey);
      }

      if (slide.audioIndex !== undefined && uploadedFiles[slide.audioIndex]) {
        const file = uploadedFiles[slide.audioIndex];
        const audioMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/aac'];
        if (!audioMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(`Invalid audio file type for slide ${i}. Supported: mp3, wav, webm, ogg, aac`);
        }
        const maxAudioSize = 10 * 1024 * 1024;
        if (file.size > maxAudioSize) {
          throw new BadRequestException(`Audio file size for slide ${i} exceeds 10MB limit.`);
        }
        const result = await this.storageService.uploadFile(file, 'exercises/audio');
        processedSlide.audioKey = result.key;
        console.log(`✅ Slide ${i} audio uploaded:`, processedSlide.audioKey);
      } else if (slide.audioKey) {
        processedSlide.audioKey = slide.audioKey;
        console.log(`✅ Slide ${i} using existing audio key:`, processedSlide.audioKey);
      }

      processedSlides.push(processedSlide);
    }

    exerciseData.coverImageKey = coverImageKey;
    exerciseData.videoKey = videoKey;
    exerciseData.slides = processedSlides;

    console.log('📝 Final exercise data:', JSON.stringify({
      ...exerciseData,
      coverImageKey,
      videoKey,
      slides: processedSlides,
    }, null, 2));

    const exercise = await this.exercisesService.createWithMedia(
      exerciseData,
      req.user.id,
      { coverImageKey, videoKey, slides: processedSlides },
    );

    const responseDto = await this.exercisesService.toResponseDto(exercise);

    return new ResponseDto({
      statusCode: HttpStatus.CREATED,
      message: 'Exercise created successfully with media',
      data: responseDto,
    });
  }

  /**
   * Get all exercises with filters and pagination
   */
  @Get()
  @ApiOperation({ summary: 'Get all exercises with filters' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'category', required: false, enum: Object.values(ExerciseCategory) })
  @ApiQuery({ name: 'difficulty', required: false, enum: ['beginner', 'intermediate', 'advanced'] })
  @ApiQuery({ name: 'search', required: false, example: 'pronunciation' })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @ApiOkResponse({
    description: 'Exercises retrieved successfully',
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
    @Query('search') search?: string,
    @Query('isActive', new DefaultValuePipe(true), ParseBoolPipe) isActive?: boolean,
  ) {
    const result = await this.exercisesService.findAll(
      page,
      limit,
      category,
      difficulty,
      search,
      isActive,
    );

    const items = await Promise.all(
      result.items.map(e => this.exercisesService.toResponseDto(e))
    );

    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Exercises retrieved successfully',
      data: {
        items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  /**
   * Get all exercise categories
   */
  @Get('categories')
  @ApiOperation({ summary: 'Get all exercise categories' })
  @ApiOkResponse({
    description: 'Categories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: { type: 'string' },
          example: ['pronunciation', 'vocabulary', 'grammar', 'comprehension', 'fluency', 'articulation', 'phonology', 'language', 'social_communication', 'other']
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getCategories() {
    const data = await this.exercisesService.getCategories();
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Categories retrieved successfully',
      data,
    });
  }

  /**
   * Search exercises
   */
  @Get('search')
  @ApiOperation({ summary: 'Search exercises' })
  @ApiQuery({ name: 'q', required: true, example: 'pronunciation' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({
    description: 'Search results retrieved successfully',
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Search query is required' })
  async search(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.exercisesService.search(query, page, limit);
    const items = await Promise.all(
      result.items.map(e => this.exercisesService.toResponseDto(e))
    );
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Search results retrieved successfully',
      data: {
        items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  /**
   * Get exercise by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get exercise by ID' })
  @ApiOkResponse({
    description: 'Exercise retrieved successfully',
    type: ExerciseResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Exercise not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const exercise = await this.exercisesService.findById(id);
    const responseDto = await this.exercisesService.toResponseDto(exercise);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Exercise retrieved successfully',
      data: responseDto,
    });
  }

  /**
   * Update an exercise (Orthophoniste only)
   */
  @Put(':id')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Update an exercise (Orthophoniste only)' })
  @ApiOkResponse({
    description: 'Exercise updated successfully',
    type: ExerciseResponseDto,
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Only orthophonistes can update exercises' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Exercise not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation failed' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
    @Request() req,
  ) {
    const exercise = await this.exercisesService.update(id, updateExerciseDto, req.user.id);
    const responseDto = await this.exercisesService.toResponseDto(exercise);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Exercise updated successfully',
      data: responseDto,
    });
  }

  /**
   * Delete an exercise (soft delete) (Orthophoniste only)
   */
  @Delete(':id')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Delete an exercise (soft delete) (Orthophoniste only)' })
  @ApiOkResponse({
    description: 'Exercise deleted successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: HttpStatus.OK },
        message: { type: 'string', example: 'Exercise deleted successfully' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/exercises/123' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Only orthophonistes can delete exercises' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Exercise not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.exercisesService.delete(id, req.user.id);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Exercise deleted successfully',
    });
  }
}