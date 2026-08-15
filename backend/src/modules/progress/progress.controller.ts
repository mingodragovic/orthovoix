// src/modules/progress/progress.controller.ts
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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ProgressResponseDto } from './dto/progress-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { ResponseDto } from '../../common/dto/response.dto';
import { ProgressType } from './interfaces/progress-type.enum';

@ApiTags('progress')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('patient/:patientId')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Record progress for a patient (Orthophoniste only)' })
  @ApiResponse({
    status: 201,
    description: 'Progress recorded successfully',
    type: ProgressResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can record progress' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async createProgress(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body() createProgressDto: CreateProgressDto,
    @Request() req,
  ) {
    createProgressDto.patientId = patientId;
    const result = await this.progressService.createProgress(createProgressDto, req.user.id);
    return new ResponseDto({
      statusCode: 201,
      message: 'Progress recorded successfully',
      data: this.progressService.toResponseDto(result),
    });
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all progress records for a patient' })
  @ApiQuery({ name: 'type', required: false, enum: ProgressType })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Progress records retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Progress records retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/progress/patient/123' }
          }
        },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProgressResponseDto' }
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
    @Query('type') type?: string,
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit?: number,
  ) {
    const results = await this.progressService.getPatientProgress(
      patientId,
      req.user.id,
      req.user.role,
      type,
      limit || undefined,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Progress records retrieved successfully',
      data: results.map(r => this.progressService.toResponseDto(r)),
    });
  }

  @Get('patient/:patientId/summary')
  @ApiOperation({ summary: 'Get progress summary for a patient' })
  @ApiResponse({
    status: 200,
    description: 'Progress summary retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Progress summary retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/progress/patient/123/summary' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                patientId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                totalRecords: { type: 'number', example: 10 },
                summary: {
                  type: 'object',
                  properties: {
                    latestOverallScore: { type: 'number', example: 85 },
                    averageOverallScore: { type: 'number', example: 75 },
                    averageScores: {
                      type: 'object',
                      example: { pronunciation: 80, vocabulary: 85, grammar: 70 }
                    },
                    totalGoals: { type: 'number', example: 5 },
                    achievedGoals: { type: 'number', example: 3 },
                    goalCompletionRate: { type: 'number', example: 60 }
                  }
                },
                trends: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
                      overallScore: { type: 'number', example: 85 },
                      type: { type: 'string', example: 'overall' }
                    }
                  }
                },
                commonStrengths: { type: 'array', items: { type: 'string' } },
                commonAreasForImprovement: { type: 'array', items: { type: 'string' } },
                goalStatusCount: {
                  type: 'object',
                  example: { 'not-started': 2, 'in-progress': 3, 'achieved': 5, 'abandoned': 0 }
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
  async getProgressSummary(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Request() req,
  ) {
    const result = await this.progressService.getProgressSummary(
      patientId,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Progress summary retrieved successfully',
      data: result,
    });
  }

  @Get('patient/:patientId/chart')
  @ApiOperation({ summary: 'Get progress chart data for visualization' })
  @ApiQuery({ name: 'type', required: false, enum: ProgressType })
  @ApiResponse({
    status: 200,
    description: 'Chart data retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Chart data retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/progress/patient/123/chart' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                patientId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                labels: { type: 'array', items: { type: 'string' }, example: ['Jan', 'Feb', 'Mar'] },
                datasets: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string', example: 'Pronunciation' },
                      data: { type: 'array', items: { type: 'number' }, example: [60, 75, 85] },
                      borderColor: { type: 'string', example: '#4CAF50' },
                      backgroundColor: { type: 'string', example: '#4CAF5033' }
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
  async getChartData(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Request() req,
    @Query('type') type?: string,
  ) {
    const result = await this.progressService.getChartData(
      patientId,
      req.user.id,
      req.user.role,
      type,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Chart data retrieved successfully',
      data: result,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single progress record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Progress record retrieved successfully',
    type: ProgressResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Progress record not found' })
  async getProgress(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const result = await this.progressService.findById(id, req.user.id, req.user.role);
    return new ResponseDto({
      statusCode: 200,
      message: 'Progress record retrieved successfully',
      data: this.progressService.toResponseDto(result),
    });
  }

  @Put(':id')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Update a progress record (Orthophoniste only)' })
  @ApiResponse({
    status: 200,
    description: 'Progress record updated successfully',
    type: ProgressResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can update progress records' })
  @ApiResponse({ status: 404, description: 'Progress record not found' })
  async updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @Request() req,
  ) {
    const result = await this.progressService.updateProgress(
      id,
      updateProgressDto,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Progress record updated successfully',
      data: this.progressService.toResponseDto(result),
    });
  }

  @Delete(':id')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Delete a progress record (Orthophoniste only)' })
  @ApiResponse({
    status: 200,
    description: 'Progress record deleted successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Progress record deleted successfully' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/progress/123' }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can delete progress records' })
  @ApiResponse({ status: 404, description: 'Progress record not found' })
  async deleteProgress(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.progressService.deleteProgress(id, req.user.id, req.user.role);
    return new ResponseDto({
      statusCode: 200,
      message: 'Progress record deleted successfully',
    });
  }
}