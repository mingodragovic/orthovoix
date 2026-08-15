// src/modules/appointments/appointments.controller.ts
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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AddSessionNotesDto } from './dto/add-session-notes.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { ResponseDto } from '../../common/dto/response.dto';
import { AppointmentStatus } from './interfaces/appointment-status.enum';

@ApiTags('appointments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Create a new appointment (Orthophoniste only)' })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can create appointments' })
  @ApiResponse({ status: 409, description: 'Conflict - Overlapping appointment' })
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    const result = await this.appointmentsService.createAppointment(
      createAppointmentDto,
      req.user.id,
    );
    return new ResponseDto({
      statusCode: 201,
      message: 'Appointment created successfully',
      data: this.appointmentsService.toResponseDto(result),
    });
  }

  @Get()
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Get all appointments (Orthophoniste only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiQuery({ name: 'startDate', required: false, example: '2024-01-01T00:00:00.000Z' })
  @ApiQuery({ name: 'endDate', required: false, example: '2024-01-31T23:59:59.000Z' })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Appointments retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/appointments' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/AppointmentResponseDto' }
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
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const result = await this.appointmentsService.getAllAppointments(
      page,
      limit,
      status,
      start,
      end,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Appointments retrieved successfully',
      data: {
        items: result.items.map(a => this.appointmentsService.toResponseDto(a)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my appointments (Both roles)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiResponse({
    status: 200,
    description: 'My appointments retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'My appointments retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/appointments/my' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/AppointmentResponseDto' }
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
  async getMyAppointments(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    const result = await this.appointmentsService.getMyAppointments(
      req.user.id,
      req.user.role,
      page,
      limit,
      status,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'My appointments retrieved successfully',
      data: {
        items: result.items.map(a => this.appointmentsService.toResponseDto(a)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get appointments for a specific patient' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Patient appointments retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'Patient appointments retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/appointments/patient/123' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/AppointmentResponseDto' }
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
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientAppointments(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.appointmentsService.getPatientAppointments(
      patientId,
      req.user.id,
      req.user.role,
      page,
      limit,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Patient appointments retrieved successfully',
      data: {
        items: result.items.map(a => this.appointmentsService.toResponseDto(a)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Appointment retrieved successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    const result = await this.appointmentsService.findById(
      id,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Appointment retrieved successfully',
      data: this.appointmentsService.toResponseDto(result),
    });
  }

  @Put(':id')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Update an appointment (Orthophoniste only)' })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can update appointments' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Overlapping appointment' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req,
  ) {
    const result = await this.appointmentsService.updateAppointment(
      id,
      updateAppointmentDto,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Appointment updated successfully',
      data: this.appointmentsService.toResponseDto(result),
    });
  }

  @Delete(':id')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Delete an appointment (soft delete - set to cancelled)' })
  @ApiResponse({
    status: 200,
    description: 'Appointment cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Appointment cancelled successfully' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/appointments/123' }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can delete appointments' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    await this.appointmentsService.deleteAppointment(
      id,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 200,
      message: 'Appointment cancelled successfully',
    });
  }

  @Post(':id/notes')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Add session notes to an appointment (Orthophoniste only)' })
  @ApiResponse({
    status: 201,
    description: 'Session notes added successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can add session notes' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async addSessionNotes(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addSessionNotesDto: AddSessionNotesDto,
    @Request() req,
  ) {
    const result = await this.appointmentsService.addSessionNotes(
      id,
      addSessionNotesDto,
      req.user.id,
      req.user.role,
    );
    return new ResponseDto({
      statusCode: 201,
      message: 'Session notes added successfully',
      data: this.appointmentsService.toResponseDto(result),
    });
  }
}