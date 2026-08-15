import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, FindOptionsRelations } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { PatientStatus } from './interfaces/patient-status.enum';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private usersService: UsersService,
  ) {}

  /**
   * Create a new patient
   */
  async create(createPatientDto: CreatePatientDto, currentUserId: string): Promise<Patient> {
    // Verify parent exists
    await this.usersService.findById(createPatientDto.parentId);

    // Verify orthophoniste exists
    await this.usersService.findById(createPatientDto.orthophonisteId);

    // Check if the current user is an orthophoniste
    const currentUser = await this.usersService.findById(currentUserId);
    if (currentUser.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can create patients');
    }

    const patient = this.patientRepository.create(createPatientDto);
    return this.patientRepository.save(patient);
  }

  /**
   * Get all patients (Orthophoniste only)
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<{ items: Patient[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Patient> = {};

    if (status) {
      where.status = status as PatientStatus;
    }

    if (search) {
      return this.searchPatients(search, page, limit, where);
    }

    const relations: FindOptionsRelations<Patient> = {
      parent: true,
      orthophoniste: true,
    };

    const [items, total] = await this.patientRepository.findAndCount({
      where,
      relations,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Search patients
   */
  private async searchPatients(
    search: string,
    page: number,
    limit: number,
    where: FindOptionsWhere<Patient>,
  ): Promise<{ items: Patient[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.patientRepository.createQueryBuilder('patient')
      .leftJoinAndSelect('patient.parent', 'parent')
      .leftJoinAndSelect('patient.orthophoniste', 'orthophoniste')
      .where('patient.firstName ILIKE :search OR patient.lastName ILIKE :search', {
        search: `%${search}%`,
      });

    if (where.status) {
      queryBuilder.andWhere('patient.status = :status', { status: where.status });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('patient.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get patients assigned to a specific orthophoniste
   */
  async findMyPatients(
    orthophonisteId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<{ items: Patient[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Patient> = {
      orthophonisteId,
    };

    if (status) {
      where.status = status as PatientStatus;
    }

    const relations: FindOptionsRelations<Patient> = {
      parent: true,
      orthophoniste: true,
    };

    const [items, total] = await this.patientRepository.findAndCount({
      where,
      relations,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get patient by child for a parent
   */
  async findMyChild(parentId: string): Promise<Patient | null> {
    const relations: FindOptionsRelations<Patient> = {
      parent: true,
      orthophoniste: true,
    };
    
    return this.patientRepository.findOne({
      where: { parentId },
      relations,
    });
  }

  /**
   * Get a single patient by ID with permission check
   */
  async findById(id: string, currentUserId: string, currentUserRole: string): Promise<Patient> {
    const relations: FindOptionsRelations<Patient> = {
      parent: true,
      orthophoniste: true,
    };
    
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations,
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    // Check permissions
    if (currentUserRole === UserRole.PARENT) {
      // Parents can only see their own child
      if (patient.parentId !== currentUserId) {
        throw new ForbiddenException('You can only access your own child\'s information');
      }
    }

    return patient;
  }

  /**
   * Update a patient
   */
  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<Patient> {
    const patient = await this.findById(id, currentUserId, currentUserRole);

    // Only orthophonistes can update
    if (currentUserRole !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can update patients');
    }

    // Verify parent exists if being updated
    if (updatePatientDto.parentId) {
      await this.usersService.findById(updatePatientDto.parentId);
    }

    // Verify orthophoniste exists if being updated
    if (updatePatientDto.orthophonisteId) {
      await this.usersService.findById(updatePatientDto.orthophonisteId);
    }

    Object.assign(patient, updatePatientDto);
    return this.patientRepository.save(patient);
  }

  /**
   * Delete a patient (soft delete by setting status to inactive)
   */
  async delete(id: string, currentUserId: string, currentUserRole: string): Promise<void> {
    const patient = await this.findById(id, currentUserId, currentUserRole);

    // Only orthophonistes can delete
    if (currentUserRole !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can delete patients');
    }

    // Soft delete - set status to inactive
    patient.status = PatientStatus.INACTIVE;
    await this.patientRepository.save(patient);
  }

  /**
   * Get patient by ID with exercises (placeholder - will be implemented with exercises module)
   */
  async getPatientExercises(id: string, currentUserId: string, currentUserRole: string): Promise<any> {
    await this.findById(id, currentUserId, currentUserRole);
    // TODO: Implement when exercises module is ready
    return {
      patientId: id,
      exercises: [],
      message: 'Exercises module not yet implemented',
    };
  }

  /**
   * Get patient progress (placeholder - will be implemented with progress module)
   */
  async getPatientProgress(id: string, currentUserId: string, currentUserRole: string): Promise<any> {
    await this.findById(id, currentUserId, currentUserRole);
    // TODO: Implement when progress module is ready
    return {
      patientId: id,
      progress: [],
      message: 'Progress module not yet implemented',
    };
  }

  /**
   * Transform patient to response DTO
   */
  toResponseDto(patient: Patient): PatientResponseDto {
    const age = this.calculateAge(patient.dateOfBirth);
    return {
      ...patient,
      fullName: `${patient.firstName} ${patient.lastName}`,
      age,
    };
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Count patients by orthophoniste
   */
  async countByOrthophoniste(orthophonisteId: string): Promise<number> {
    return this.patientRepository.count({
      where: { 
        orthophonisteId, 
        status: PatientStatus.ACTIVE 
      },
    });
  }

  /**
   * Count patients by parent
   */
  async countByParent(parentId: string): Promise<number> {
    return this.patientRepository.count({
      where: { 
        parentId, 
        status: PatientStatus.ACTIVE 
      },
    });
  }
}