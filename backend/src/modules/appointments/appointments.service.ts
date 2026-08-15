// src/modules/appointments/appointments.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations, Between, MoreThan, LessThan } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AddSessionNotesDto } from './dto/add-session-notes.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { AppointmentStatus, AppointmentType } from './interfaces/appointment-status.enum';
import { PatientsService } from '../patients/patients.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/interfaces/user-roles.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private patientsService: PatientsService,
    private usersService: UsersService,
  ) {}

  /**
   * Create a new appointment
   */
  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
    currentUserId: string,
  ): Promise<Appointment> {
    // Verify patient exists
    const patient = await this.patientsService.findById(
      createAppointmentDto.patientId,
      currentUserId,
      UserRole.ORTHOPHONISTE,
    );

    // Verify the user is an orthophoniste
    const user = await this.usersService.findById(currentUserId);
    if (user.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can create appointments');
    }

    // Check for overlapping appointments
    await this.checkOverlappingAppointments(
      createAppointmentDto.patientId,
      createAppointmentDto.dateTime,
      createAppointmentDto.duration,
    );

    const appointment = this.appointmentRepository.create({
      patientId: createAppointmentDto.patientId,
      orthophonisteId: currentUserId,
      dateTime: createAppointmentDto.dateTime,
      duration: createAppointmentDto.duration,
      type: createAppointmentDto.type || AppointmentType.THERAPY_SESSION,
      location: createAppointmentDto.location,
      meetingLink: createAppointmentDto.meetingLink,
      isVirtual: createAppointmentDto.isVirtual || false,
      notes: createAppointmentDto.notes,
      status: AppointmentStatus.SCHEDULED,
    });

    return this.appointmentRepository.save(appointment);
  }

  /**
   * Get all appointments (Orthophoniste only)
   */
  async getAllAppointments(
    page: number = 1,
    limit: number = 10,
    status?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ items: Appointment[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.dateTime = Between(startDate, endDate);
    } else if (startDate) {
      where.dateTime = MoreThan(startDate);
    } else if (endDate) {
      where.dateTime = LessThan(endDate);
    }

    const relations: FindOptionsRelations<Appointment> = {
      patient: true,
      orthophoniste: true,
    };

    const [items, total] = await this.appointmentRepository.findAndCount({
      where,
      relations,
      skip,
      take: limit,
      order: { dateTime: 'ASC' },
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get my appointments (for orthophoniste or parent)
   */
  async getMyAppointments(
    currentUserId: string,
    currentUserRole: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<{ items: Appointment[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (currentUserRole === UserRole.ORTHOPHONISTE) {
      where.orthophonisteId = currentUserId;
    } else if (currentUserRole === UserRole.PARENT) {
      // Find patient for this parent
      const patient = await this.patientsService.findMyChild(currentUserId);
      if (!patient) {
        return { items: [], total: 0, page, limit };
      }
      where.patientId = patient.id;
    }

    if (status) {
      where.status = status;
    }

    const relations: FindOptionsRelations<Appointment> = {
      patient: true,
      orthophoniste: true,
    };

    const [items, total] = await this.appointmentRepository.findAndCount({
      where,
      relations,
      skip,
      take: limit,
      order: { dateTime: 'ASC' },
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get appointments for a specific patient
   */
  async getPatientAppointments(
    patientId: string,
    currentUserId: string,
    currentUserRole: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: Appointment[]; total: number; page: number; limit: number }> {
    // Verify patient exists and user has access
    await this.patientsService.findById(patientId, currentUserId, currentUserRole);

    const skip = (page - 1) * limit;
    const where: any = { patientId };

    const relations: FindOptionsRelations<Appointment> = {
      patient: true,
      orthophoniste: true,
    };

    const [items, total] = await this.appointmentRepository.findAndCount({
      where,
      relations,
      skip,
      take: limit,
      order: { dateTime: 'ASC' },
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single appointment by ID
   */
  async findById(id: string, currentUserId: string, currentUserRole: string): Promise<Appointment> {
    const relations: FindOptionsRelations<Appointment> = {
      patient: true,
      orthophoniste: true,
    };

    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations,
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // Check access
    if (currentUserRole === UserRole.PARENT) {
      const patient = await this.patientsService.findMyChild(currentUserId);
      if (!patient || patient.id !== appointment.patientId) {
        throw new ForbiddenException('You can only view your own appointments');
      }
    }

    return appointment;
  }

  /**
   * Update an appointment
   */
  async updateAppointment(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<Appointment> {
    const appointment = await this.findById(id, currentUserId, currentUserRole);

    // Only orthophonistes can update appointments
    if (currentUserRole !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can update appointments');
    }

    // If date/time is being changed, check for overlaps
    if (updateAppointmentDto.dateTime || updateAppointmentDto.duration) {
      const newDateTime = updateAppointmentDto.dateTime || appointment.dateTime;
      const newDuration = updateAppointmentDto.duration || appointment.duration;
      await this.checkOverlappingAppointments(
        appointment.patientId,
        newDateTime,
        newDuration,
        id, // Exclude current appointment
      );
    }

    // If status is being changed to completed, add session note if provided
    if (updateAppointmentDto.status === AppointmentStatus.COMPLETED) {
      // If no session notes exist, create a basic one
      if (!appointment.sessionNotes || appointment.sessionNotes.length === 0) {
        appointment.sessionNotes = [
          {
            date: new Date(),
            notes: updateAppointmentDto.notes || 'Session completed',
            duration: updateAppointmentDto.duration || appointment.duration,
          },
        ];
      }
    }

    // Remove undefined values
    Object.keys(updateAppointmentDto).forEach(key => {
      if (updateAppointmentDto[key as keyof UpdateAppointmentDto] === undefined) {
        delete updateAppointmentDto[key as keyof UpdateAppointmentDto];
      }
    });

    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentRepository.save(appointment);
  }

  /**
   * Delete an appointment
   */
  async deleteAppointment(
    id: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<void> {
    const appointment = await this.findById(id, currentUserId, currentUserRole);

    // Only orthophonistes can delete appointments
    if (currentUserRole !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can delete appointments');
    }

    // Soft delete - set status to cancelled
    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancellationReason = 'Deleted by orthophoniste';
    await this.appointmentRepository.save(appointment);
  }

  /**
   * Add session notes to an appointment
   */
  async addSessionNotes(
    id: string,
    addSessionNotesDto: AddSessionNotesDto,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<Appointment> {
    const appointment = await this.findById(id, currentUserId, currentUserRole);

    // Only orthophonistes can add session notes
    if (currentUserRole !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can add session notes');
    }

    const sessionNote = {
      date: new Date(),
      notes: addSessionNotesDto.notes,
      duration: addSessionNotesDto.duration,
      topics: addSessionNotesDto.topics,
      progress: addSessionNotesDto.progress,
      nextSteps: addSessionNotesDto.nextSteps,
    };

    if (!appointment.sessionNotes) {
      appointment.sessionNotes = [];
    }
    appointment.sessionNotes.push(sessionNote);

    // If status is still scheduled, update to in-progress or completed
    if (appointment.status === AppointmentStatus.SCHEDULED) {
      appointment.status = AppointmentStatus.IN_PROGRESS;
    }

    return this.appointmentRepository.save(appointment);
  }

  /**
   * Check for overlapping appointments
   */
 private async checkOverlappingAppointments(
  patientId: string,
  dateTime: Date,
  duration: number,
  excludeId?: string,
): Promise<void> {
  const startTime = new Date(dateTime);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  // Build the query using a different approach
  const queryBuilder = this.appointmentRepository
    .createQueryBuilder('appointment')
    .where('appointment.patientId = :patientId', { patientId })
    .andWhere('appointment.status != :status', { status: AppointmentStatus.CANCELLED })
    .andWhere(
      'appointment.dateTime < :endTime AND (appointment.dateTime + (appointment.duration * interval \'1 minute\')) > :startTime',
      {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      },
    );

  if (excludeId) {
    queryBuilder.andWhere('appointment.id != :excludeId', { excludeId });
  }

  const overlapping = await queryBuilder.getCount();

  if (overlapping > 0) {
    throw new BadRequestException('Patient already has an appointment scheduled at this time');
  }
}
  /**
   * Transform to response DTO
   */
  toResponseDto(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patient
        ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
        : 'Unknown',
      orthophonisteId: appointment.orthophonisteId,
      orthophonisteName: appointment.orthophoniste?.name || 'Unknown',
      dateTime: appointment.dateTime,
      duration: appointment.duration,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes,
      sessionNotes: appointment.sessionNotes,
      cancellationReason: appointment.cancellationReason,
      location: appointment.location,
      meetingLink: appointment.meetingLink,
      isVirtual: appointment.isVirtual,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }
}