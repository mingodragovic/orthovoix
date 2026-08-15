// src/modules/patient-exercises/patient-exercises.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { PatientExercisesService } from './patient-exercises.service';
import { AssignExerciseDto } from './dto/assign-exercise.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { PatientExerciseResponseDto } from './dto/patient-exercise-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { ResponseDto } from '../../common/dto/response.dto';
import { PatientExerciseStatus } from './interfaces/patient-exercise-status.enum';
import { PatientsService } from '../patients/patients.service';
import { StorageService } from '../storage/storage.service';

@ApiTags('patient-exercises')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patient-exercises')
export class PatientExercisesController {
  constructor(
    private readonly patientExercisesService: PatientExercisesService,
    private readonly patientsService: PatientsService,
      private readonly storageService: StorageService,
  ) {}

  @Get()
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Get all patient-exercise assignments (Orthophoniste only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: PatientExerciseStatus })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
  @ApiQuery({ name: 'exerciseId', required: false, description: 'Filter by exercise ID' })
  @ApiResponse({
    status: 200,
    description: 'All assignments retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'All assignments retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/patient-exercises' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/PatientExerciseResponseDto' }
                },
                total: { type: 'number', example: 10 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 1 }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can view all assignments' })
  async findAllAssignments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
    @Query('exerciseId') exerciseId?: string,
  ) {
    const result = await this.patientExercisesService.findAllAssignments(
      page,
      limit,
      status,
      patientId,
      exerciseId,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'All assignments retrieved successfully',
      data: {
        items: result.items.map(a => this.patientExercisesService.toResponseDto(a)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  @Post('assign')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Assign an exercise to a patient (Orthophoniste only)' })
  @ApiResponse({
    status: 201,
    description: 'Exercise assigned successfully',
    type: PatientExerciseResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can assign exercises' })
  @ApiResponse({ status: 404, description: 'Patient or exercise not found' })
  async assignExercise(@Body() assignExerciseDto: AssignExerciseDto, @Request() req) {
    const result = await this.patientExercisesService.assignExercise(
      assignExerciseDto,
      req.user.id,
    );
    return new ResponseDto({
      statusCode: 201,
      message: 'Exercise assigned successfully',
      data: this.patientExercisesService.toResponseDto(result),
    });
  }

  
  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all exercises assigned to a patient' })
  @ApiQuery({ name: 'status', required: false, enum: PatientExerciseStatus })
  @ApiResponse({
    status: 200,
    description: 'Patient exercises retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Patient exercises retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/patient-exercises/patient/123' }
          }
        },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/PatientExerciseResponseDto' }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only access your own child\'s exercises' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientExercises(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Request() req: any,
    @Query('status') status?: string,
  ) {
    const results = await this.patientExercisesService.getPatientExercises(
      patientId,
      req.user.id,
      req.user.role,
      status,
    );

    // Transform each result with cover image URL
    const transformedResults = await Promise.all(
      results.map(async (result) => {
        const dto = this.patientExercisesService.toResponseDto(result);
        
        // Generate cover image URL if exercise has coverImageKey
        if (result.exercise?.coverImageKey) {
          try {
            dto.coverImageUrl = await this.storageService.getFileUrl(
              result.exercise.coverImageKey,
              3600
            );
          } catch (error) {
            // If file not found, leave undefined
          }
        }
        
        return dto;
      })
    );

    return new ResponseDto({
      statusCode: 200,
      message: 'Patient exercises retrieved successfully',
      data: transformedResults,
    });
  }
  @Get('patient/:patientId/progress')
  @ApiOperation({ summary: 'Get patient progress summary' })
  @ApiResponse({
    status: 200,
    description: 'Patient progress retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Patient progress retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/patient-exercises/patient/123/progress' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                patientId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                summary: {
                  type: 'object',
                  properties: {
                    totalExercises: { type: 'number', example: 10 },
                    completedExercises: { type: 'number', example: 5 },
                    inProgressExercises: { type: 'number', example: 3 },
                    overdueExercises: { type: 'number', example: 2 },
                    completionRate: { type: 'number', example: 50 },
                    averageScore: { type: 'number', example: 75 }
                  }
                },
                categoryBreakdown: {
                  type: 'object',
                  additionalProperties: { type: 'number' },
                  example: { pronunciation: 4, vocabulary: 3, grammar: 3 }
                },
                recentLogs: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
                      status: { type: 'string', example: 'completed' },
                      notes: { type: 'string', example: 'Excellent progress!' }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientProgress(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Request() req,
  ) {
    const result = await this.patientExercisesService.getPatientProgressSummary(
      patientId,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Patient progress retrieved successfully',
      data: result,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient-exercise assignment details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Assignment details retrieved successfully',
    type: PatientExerciseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async getAssignment(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const result = await this.patientExercisesService.findById(id);
    await this.patientsService.findById(
      result.patientId,
      req.user.id,
      req.user.role,
    );

    const dto = this.patientExercisesService.toResponseDto(result);
    
    // Generate cover image URL if exercise has coverImageKey
    if (result.exercise?.coverImageKey) {
      try {
        dto.coverImageUrl = await this.storageService.getFileUrl(
          result.exercise.coverImageKey,
          3600
        );
      } catch (error) {
        // If file not found, leave undefined
      }
    }

    return new ResponseDto({
      statusCode: 200,
      message: 'Assignment details retrieved successfully',
      data: dto,
    });
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update exercise status' })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
    type: PatientExerciseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    const result = await this.patientExercisesService.updateStatus(
      id,
      updateStatusDto,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Status updated successfully',
      data: this.patientExercisesService.toResponseDto(result),
    });
  }

  @Put(':id/progress')
  @ApiOperation({ summary: 'Update exercise progress (performance and logs)' })
  @ApiResponse({
    status: 200,
    description: 'Progress updated successfully',
    type: PatientExerciseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @Request() req,
  ) {
    const result = await this.patientExercisesService.updateProgress(
      id,
      updateProgressDto,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Progress updated successfully',
      data: this.patientExercisesService.toResponseDto(result),
    });
  }
}