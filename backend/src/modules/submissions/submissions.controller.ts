// src/modules/submissions/submissions.controller.ts
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
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBody,
} from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto, UpdateSubmissionStatusDto } from './dto/update-submission.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { ResponseDto } from '../../common/dto/response.dto';
import { SubmissionStatus } from './interfaces/submission-status.enum';

@ApiTags('submissions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @Roles(UserRole.PARENT, UserRole.ORTHOPHONISTE)
  @ApiOperation({ 
    summary: 'Create a new submission with multiple answers (one per slide)',
    description: 'Submit answers for all slides in an exercise. Each answer must have a unique slide index matching the exercise slides.'
  })
  @ApiBody({ type: CreateSubmissionDto })
  @ApiCreatedResponse({
    description: 'Submission created successfully',
    type: SubmissionResponseDto,
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Patient exercise not found' })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid answers - must match exercise slides or duration exceeds 10 seconds' 
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async create(@Body() createSubmissionDto: CreateSubmissionDto, @Request() req) {
    const submission = await this.submissionsService.create(
      createSubmissionDto,
      req.user.id,
      req.user.role,
    );
    const responseDto = await this.submissionsService.toResponseDto(submission);
    return new ResponseDto({
      statusCode: HttpStatus.CREATED,
      message: 'Submission created successfully',
      data: responseDto,
    });
  }

  @Get()
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Get all submissions (Admin only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: SubmissionStatus })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
  @ApiQuery({ name: 'exerciseId', required: false, description: 'Filter by exercise ID' })
  @ApiOkResponse({
    description: 'Submissions retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: HttpStatus.OK },
            message: { example: 'Submissions retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/submissions' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/SubmissionResponseDto' }
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
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Only orthophonistes can view all submissions' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
    @Query('exerciseId') exerciseId?: string,
  ) {
    const result = await this.submissionsService.findAll(
      page,
      limit,
      status,
      patientId,
      exerciseId,
    );
    const items = await Promise.all(
      result.items.map((s) => this.submissionsService.toResponseDto(s)),
    );
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Submissions retrieved successfully',
      data: {
        items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  @Get('my')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Get my child\'s submissions (Parent only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({
    description: 'Submissions retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: HttpStatus.OK },
            message: { example: 'Submissions retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/submissions/my' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/SubmissionResponseDto' }
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
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Only parents can view their child\'s submissions' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findMySubmissions(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.submissionsService.findByParent(
      req.user.id,
      page,
      limit,
    );
    const items = await Promise.all(
      result.items.map((s) => this.submissionsService.toResponseDto(s)),
    );
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Submissions retrieved successfully',
      data: {
        items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  @Get('patient/:patientId')
  @Roles(UserRole.ORTHOPHONISTE, UserRole.PARENT)
  @ApiOperation({ summary: 'Get submissions for a specific patient' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({
    description: 'Patient submissions retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: HttpStatus.OK },
            message: { example: 'Patient submissions retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/submissions/patient/123' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/SubmissionResponseDto' }
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
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Patient not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.submissionsService.findByPatient(
      patientId,
      req.user.id,
      req.user.role,
      page,
      limit,
    );
    const items = await Promise.all(
      result.items.map((s) => this.submissionsService.toResponseDto(s)),
    );
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Patient submissions retrieved successfully',
      data: {
        items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  @Get('patient/:patientId/stats')
  @Roles(UserRole.ORTHOPHONISTE, UserRole.PARENT)
  @ApiOperation({ summary: 'Get submission statistics for a patient' })
  @ApiOkResponse({
    description: 'Statistics retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: HttpStatus.OK },
            message: { example: 'Statistics retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/submissions/patient/123/stats' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                totalSubmissions: { type: 'number', example: 10 },
                pendingSubmissions: { type: 'number', example: 3 },
                reviewedSubmissions: { type: 'number', example: 4 },
                approvedSubmissions: { type: 'number', example: 2 },
                needsImprovement: { type: 'number', example: 1 },
                rejectedSubmissions: { type: 'number', example: 0 },
                completionRate: { type: 'number', example: 75 }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Patient not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getPatientStats(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Request() req,
  ) {
    await this.submissionsService['patientsService'].findById(
      patientId,
      req.user.id,
      req.user.role,
    );
    const stats = await this.submissionsService.getPatientStats(patientId);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Statistics retrieved successfully',
      data: stats,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get submission by ID' })
  @ApiOkResponse({
    description: 'Submission retrieved successfully',
    type: SubmissionResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Submission not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const submission = await this.submissionsService.findById(
      id,
      req.user.id,
      req.user.role,
    );
    const responseDto = await this.submissionsService.toResponseDto(submission);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Submission retrieved successfully',
      data: responseDto,
    });
  }

  @Put(':id/status')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Update submission status (Admin only)' })
  @ApiBody({ type: UpdateSubmissionStatusDto })
  @ApiOkResponse({
    description: 'Status updated successfully',
    type: SubmissionResponseDto,
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Only orthophonistes can review submissions' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Submission not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid status' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateSubmissionStatusDto,
    @Request() req,
  ) {
    const submission = await this.submissionsService.updateStatus(
      id,
      updateStatusDto,
      req.user.id,
    );
    const responseDto = await this.submissionsService.toResponseDto(submission);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Status updated successfully',
      data: responseDto,
    });
  }

  @Put(':id')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Update submission (Admin only)' })
  @ApiBody({ type: UpdateSubmissionDto })
  @ApiOkResponse({
    description: 'Submission updated successfully',
    type: SubmissionResponseDto,
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Only orthophonistes can update submissions' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Submission not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation failed' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @Request() req,
  ) {
    const submission = await this.submissionsService.update(
      id,
      updateSubmissionDto,
      req.user.id,
    );
    const responseDto = await this.submissionsService.toResponseDto(submission);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Submission updated successfully',
      data: responseDto,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Delete submission (Admin only)' })
  @ApiOkResponse({
    description: 'Submission deleted successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: HttpStatus.OK },
        message: { type: 'string', example: 'Submission deleted successfully' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/submissions/123' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Only orthophonistes can delete submissions' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Submission not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.submissionsService.delete(id, req.user.id);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Submission deleted successfully',
    });
  }
}