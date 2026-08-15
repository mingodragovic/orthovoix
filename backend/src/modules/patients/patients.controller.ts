// src/modules/patients/patients.controller.ts
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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { ResponseDto } from '../../common/dto/response.dto';
import { MESSAGES } from '../../constants/messages';

@ApiTags('patients')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({
    status: 201,
    description: 'Patient created successfully',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can create patients' })
  @ApiResponse({ status: 404, description: 'Parent or orthophoniste not found' })
  async create(@Body() createPatientDto: CreatePatientDto, @Request() req) {
    const patient = await this.patientsService.create(createPatientDto, req.user.id);
    return new ResponseDto({
      statusCode: 201,
      message: 'Patient created successfully',
      data: this.patientsService.toResponseDto(patient),
    });
  }

  @Get()
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Get all patients (Orthophoniste only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'Emma' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'discharged'] })
  @ApiResponse({
    status: 200,
    description: 'Patients retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Patients retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/patients' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/PatientResponseDto' }
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
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.patientsService.findAll(page, limit, search, status);
    return new ResponseDto({
      statusCode: 200,
      message: 'Patients retrieved successfully',
      data: {
        items: result.items.map(p => this.patientsService.toResponseDto(p)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  @Get('my-patients')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Get patients assigned to the current orthophoniste' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'discharged'] })
  @ApiResponse({
    status: 200,
    description: 'My patients retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'My patients retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/patients/my-patients' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/PatientResponseDto' }
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
  async findMyPatients(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    const result = await this.patientsService.findMyPatients(
      req.user.id,
      page,
      limit,
      status,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'My patients retrieved successfully',
      data: {
        items: result.items.map(p => this.patientsService.toResponseDto(p)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  @Get('my-child')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Get my child\'s information (Parent only)' })
  @ApiResponse({
    status: 200,
    description: 'Child information retrieved successfully',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No child found for this parent' })
  async getMyChild(@Request() req) {
    const patient = await this.patientsService.findMyChild(req.user.id);
    if (!patient) {
      return new ResponseDto({
        statusCode: 404,
        message: 'No child found for this parent',
        data: null,
      });
    }
    return new ResponseDto({
      statusCode: 200,
      message: 'Child information retrieved successfully',
      data: this.patientsService.toResponseDto(patient),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient retrieved successfully',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only access your own child\'s information' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const patient = await this.patientsService.findById(
      id,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Patient retrieved successfully',
      data: this.patientsService.toResponseDto(patient),
    });
  }

  @Put(':id')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Update a patient (Orthophoniste only)' })
  @ApiResponse({
    status: 200,
    description: 'Patient updated successfully',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can update patients' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Request() req,
  ) {
    const patient = await this.patientsService.update(
      id,
      updatePatientDto,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Patient updated successfully',
      data: this.patientsService.toResponseDto(patient),
    });
  }

  @Delete(':id')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Delete a patient (soft delete - set status to inactive)' })
  @ApiResponse({
    status: 200,
    description: 'Patient deleted successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Patient deleted successfully' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/patients/123' }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can delete patients' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.patientsService.delete(id, req.user.id, req.user.role);
    return new ResponseDto({
      statusCode: 200,
      message: 'Patient deleted successfully',
    });
  }

  @Get(':id/exercises')
  @ApiOperation({ summary: 'Get patient\'s exercises (Placeholder)' })
  @ApiResponse({
    status: 200,
    description: 'Exercises retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Patient exercises retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/patients/123/exercises' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                patientId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                exercises: { type: 'array', items: { type: 'object' }, example: [] },
                message: { type: 'string', example: 'Exercises module not yet implemented' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientExercises(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const data = await this.patientsService.getPatientExercises(
      id,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Patient exercises retrieved successfully',
      data,
    });
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get patient\'s progress (Placeholder)' })
  @ApiResponse({
    status: 200,
    description: 'Progress retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Patient progress retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/patients/123/progress' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                patientId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                progress: { type: 'array', items: { type: 'object' }, example: [] },
                message: { type: 'string', example: 'Progress module not yet implemented' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientProgress(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const data = await this.patientsService.getPatientProgress(
      id,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Patient progress retrieved successfully',
      data,
    });
  }
}