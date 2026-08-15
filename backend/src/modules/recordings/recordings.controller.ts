// src/modules/recordings/recordings.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { RecordingsService } from './recordings.service';
import { CreateRecordingDto } from './dto/create-recording.dto';
import { UpdateRecordingReviewDto } from './dto/update-recording-review.dto';
import { RecordingResponseDto } from './dto/recording-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { ResponseDto } from '../../common/dto/response.dto';
import { RecordingStatus } from './interfaces/recording-status.enum';

@ApiTags('recordings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recordings')
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  /**
   * GET ALL RECORDINGS (Orthophoniste Dashboard)
   */
  @Get('all')
@Roles(UserRole.ORTHOPHONISTE)
@ApiOperation({ summary: 'Get all recordings across all patients (Orthophoniste only)' })
@ApiQuery({ name: 'page', required: false, example: 1 })
@ApiQuery({ name: 'limit', required: false, example: 10 })
@ApiQuery({ name: 'status', required: false, enum: RecordingStatus })
@ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
@ApiQuery({ name: 'exerciseId', required: false, description: 'Filter by exercise ID' })
@ApiOkResponse({
  description: 'All recordings retrieved successfully',
  schema: {
    allOf: [
      {
        properties: {
          statusCode: { example: 200 },
          message: { example: 'All recordings retrieved successfully' },
          timestamp: { example: '2024-01-15T10:00:00.000Z' },
          path: { example: '/api/recordings/all' },
        },
      },
      {
        properties: {
          data: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '425f7b79-975d-48b5-b8d0-43913c850a3a' },
                    patientExerciseId: { type: 'string', example: '49590c35-0fdd-486a-86f7-f8b9fd7b6bc1' },
                    recordingUrl: { type: 'string', example: 'http://localhost:9000/orthovoix/recordings/...' },
                    recordingKey: { type: 'string', example: 'recordings/...' },
                    duration: { type: 'number', example: 3.5 },
                    notes: { type: 'string', example: 'First attempt, needs more practice' },
                    status: { type: 'string', enum: Object.values(RecordingStatus), example: 'pending' },
                    feedback: { type: 'string', example: 'Great effort!' },
                    reviewedAt: { type: 'string', format: 'date-time', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    // ✅ NEW: Patient and exercise info
                    patientName: { type: 'string', example: 'Emma Martin' },
                    exerciseTitle: { type: 'string', example: 'Vocabulary Building - Food Words' },
                    patientId: { type: 'string', example: 'fba6f68f-f4ed-4f1a-895e-c916273e5066' },
                    exerciseId: { type: 'string', example: '27cfdcb3-5546-4f88-b6f4-29e76b03eee3' },
                  },
                },
              },
              total: { type: 'number', example: 10 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              totalPages: { type: 'number', example: 1 },
            },
          },
        },
      },
    ],
  },
})
@ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can view all recordings' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
async getAllRecordings(
  @Request() req,
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  @Query('status') status?: string,
  @Query('patientId') patientId?: string,
  @Query('exerciseId') exerciseId?: string,
) {
  const result = await this.recordingsService.getAllRecordings(
    page,
    limit,
    status,
    patientId,
    exerciseId,
    req.user.id,
  );
  return new ResponseDto({
    statusCode: 200,
    message: 'All recordings retrieved successfully',
    data: {
      items: result.items.map((r) => this.recordingsService.toResponseDto(r)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    },
  });
}
  /**
   * Get recordings for a specific patient
   */
  @Get('patient/:patientId')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Get all recordings for a patient (Orthophoniste only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({
    description: 'Patient recordings retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Patient recordings retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/recordings/patient/123' },
          },
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/RecordingResponseDto' },
                },
                total: { type: 'number', example: 10 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 1 },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can view patient recordings' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientRecordings(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.recordingsService.getRecordingsForPatient(
      patientId,
      req.user.id,
      req.user.role,
      page,
      limit,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Patient recordings retrieved successfully',
      data: {
        items: result.items.map((r) => this.recordingsService.toResponseDto(r)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  /**
   * Get recordings for a specific assignment
   */
  @Get('patient-exercises/:patientExerciseId')
  @ApiOperation({ summary: 'Get all recordings for a patient-exercise assignment' })
  @ApiOkResponse({
    description: 'Recordings retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Recordings retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/recordings/patient-exercises/123' },
          },
        },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/RecordingResponseDto' },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAssignmentRecordings(
    @Param('patientExerciseId', ParseUUIDPipe) patientExerciseId: string,
    @Request() req,
  ) {
    const results = await this.recordingsService.getRecordingsForAssignment(
      patientExerciseId,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Recordings retrieved successfully',
      data: results.map((r) => this.recordingsService.toResponseDto(r)),
    });
  }

  /**
   * Create a new recording
   */
  @Post('patient-exercises/:patientExerciseId')
  @ApiOperation({ summary: 'Create a new recording for a patient-exercise assignment' })
  @ApiCreatedResponse({
    description: 'Recording created successfully',
    type: RecordingResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only upload recordings for your own child' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createRecording(
    @Param('patientExerciseId', ParseUUIDPipe) patientExerciseId: string,
    @Body() createRecordingDto: CreateRecordingDto,
    @Request() req,
  ) {
    const result = await this.recordingsService.createRecording(
      patientExerciseId,
      createRecordingDto,
      req.user.id,
    );
    return new ResponseDto({
      statusCode: 201,
      message: 'Recording created successfully',
      data: this.recordingsService.toResponseDto(result),
    });
  }

  /**
   * Get recording by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a recording by ID' })
  @ApiOkResponse({
    description: 'Recording retrieved successfully',
    type: RecordingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Recording not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRecording(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    const result = await this.recordingsService.findById(
      id,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Recording retrieved successfully',
      data: this.recordingsService.toResponseDto(result),
    });
  }

  /**
   * Get fresh presigned URL
   */
  @Get(':id/url')
  @ApiOperation({ summary: 'Get a fresh presigned URL for a recording' })
  @ApiOkResponse({
    description: 'Presigned URL generated successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Presigned URL generated successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/recordings/123/url' },
          },
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example: 'http://localhost:9000/orthovoix/recordings/...',
                },
                expiresIn: { type: 'number', example: 604800 },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Recording not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getFreshUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    const url = await this.recordingsService.getFreshRecordingUrl(
      id,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Presigned URL generated successfully',
      data: {
        url,
        expiresIn: 604800, // 7 days
      },
    });
  }

  /**
   * Review recording (Orthophoniste only)
   */
  @Patch(':id/review')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Update recording review status (Orthophoniste only)' })
  @ApiOkResponse({
    description: 'Recording review updated successfully',
    type: RecordingResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can review recordings' })
  @ApiResponse({ status: 404, description: 'Recording not found' })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  async updateReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecordingReviewDto: UpdateRecordingReviewDto,
    @Request() req,
  ) {
    const result = await this.recordingsService.updateReview(
      id,
      updateRecordingReviewDto,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Recording review updated successfully',
      data: this.recordingsService.toResponseDto(result),
    });
  }

  /**
   * Delete recording
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recording' })
  @ApiOkResponse({
    description: 'Recording deleted successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Recording deleted successfully' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/recordings/123' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Recording not found' })
  async deleteRecording(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    await this.recordingsService.deleteRecording(
      id,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Recording deleted successfully',
    });
  }
}