// src/modules/recordings/recordings.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations } from 'typeorm';
import { Recording } from './entities/recording.entity';
import { CreateRecordingDto } from './dto/create-recording.dto';
import { UpdateRecordingReviewDto } from './dto/update-recording-review.dto';
import { RecordingResponseDto } from './dto/recording-response.dto';
import { RecordingStatus } from './interfaces/recording-status.enum';
import { PatientExercisesService } from '../patient-exercises/patient-exercises.service';
import { PatientsService } from '../patients/patients.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class RecordingsService {
  constructor(
    @InjectRepository(Recording)
    private recordingRepository: Repository<Recording>,
    private patientExercisesService: PatientExercisesService,
    private patientsService: PatientsService,
    private usersService: UsersService,
    private storageService: StorageService,
  ) {}

  /**
   * Create a new recording
   */
  async createRecording(
    patientExerciseId: string,
    createRecordingDto: CreateRecordingDto,
    currentUserId: string,
  ): Promise<Recording> {
    // Get the assignment
    const assignment = await this.patientExercisesService.findById(patientExerciseId);

    // Verify the patient belongs to the parent (if role is parent)
    const user = await this.usersService.findById(currentUserId);
    if (user.role === UserRole.PARENT) {
      const patient = await this.patientsService.findById(
        assignment.patientId,
        currentUserId,
        user.role,
      );
      if (!patient) {
        throw new ForbiddenException('You can only upload recordings for your own child');
      }
    }

    // Verify the orthophoniste is assigned to this patient (if role is orthophoniste)
    if (user.role === UserRole.ORTHOPHONISTE) {
      const patient = await this.patientsService.findById(
        assignment.patientId,
        currentUserId,
        user.role,
      );
      if (!patient) {
        throw new ForbiddenException('You are not assigned to this patient');
      }
    }

    // Create the recording
    const recording = this.recordingRepository.create({
      patientExerciseId,
      recordingUrl: createRecordingDto.recordingUrl,
      recordingKey: createRecordingDto.recordingKey,
      duration: createRecordingDto.duration,
      notes: createRecordingDto.notes,
      status: RecordingStatus.PENDING,
    });

    return this.recordingRepository.save(recording);
  }

  /**
   * Get all recordings for an assignment
   */
  async getRecordingsForAssignment(
    patientExerciseId: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<Recording[]> {
    // Get the assignment
    const assignment = await this.patientExercisesService.findById(patientExerciseId);

    // Verify access
    if (currentUserRole === UserRole.PARENT) {
      await this.patientsService.findById(
        assignment.patientId,
        currentUserId,
        currentUserRole,
      );
    } else if (currentUserRole === UserRole.ORTHOPHONISTE) {
      await this.patientsService.findById(
        assignment.patientId,
        currentUserId,
        currentUserRole,
      );
    }

    return this.recordingRepository.find({
      where: { patientExerciseId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all recordings for a patient (Orthophoniste dashboard)
   */
  async getRecordingsForPatient(
    patientId: string,
    currentUserId: string,
    currentUserRole: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: Recording[]; total: number; page: number; limit: number }> {
    // Verify access
    await this.patientsService.findById(patientId, currentUserId, currentUserRole);

    const skip = (page - 1) * limit;

    // Get all patient-exercise assignments for this patient
    const assignments = await this.patientExercisesService.getPatientExercises(
      patientId,
      currentUserId,
      currentUserRole,
    );

    const assignmentIds = assignments.map(a => a.id);

    if (assignmentIds.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        limit,
      };
    }

    const [items, total] = await this.recordingRepository.findAndCount({
      where: { patientExerciseId: assignmentIds as any },
      relations: { patientExercise: { exercise: true } },
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
   * Get all recordings across all patients (Orthophoniste only)
   */
 async getAllRecordings(
  page: number = 1,
  limit: number = 10,
  status?: string,
  patientId?: string,
  exerciseId?: string,
  currentUserId?: string,
): Promise<{ 
  items: Recording[]; 
  total: number; 
  page: number; 
  limit: number 
}> {
  // Verify the user is an orthophoniste
  if (currentUserId) {
    const user = await this.usersService.findById(currentUserId);
    if (user.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can view all recordings');
    }
  }

  const skip = (page - 1) * limit;

  // Build query with relations (including patient and exercise)
  const queryBuilder = this.recordingRepository
    .createQueryBuilder('recording')
    .leftJoinAndSelect('recording.patientExercise', 'patientExercise')
    .leftJoinAndSelect('patientExercise.patient', 'patient')
    .leftJoinAndSelect('patientExercise.exercise', 'exercise');

  // Apply filters
  if (status) {
    queryBuilder.andWhere('recording.status = :status', { status });
  }

  if (exerciseId) {
    queryBuilder.andWhere('patientExercise.exerciseId = :exerciseId', { exerciseId });
  }

  if (patientId) {
    // Verify the patient exists and belongs to the orthophoniste
    await this.patientsService.findById(
      patientId,
      currentUserId || '',
      UserRole.ORTHOPHONISTE,
    );
    queryBuilder.andWhere('patient.id = :patientId', { patientId });
  }

  // Order by most recent first
  queryBuilder.orderBy('recording.createdAt', 'DESC');

  // Apply pagination
  queryBuilder.skip(skip).take(limit);

  const [items, total] = await queryBuilder.getManyAndCount();

  return {
    items,
    total,
    page,
    limit,
  };
}

  /**
   * Get a single recording by ID
   */
  async findById(
    id: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<Recording> {
    const recording = await this.recordingRepository.findOne({
      where: { id },
      relations: { patientExercise: { patient: true } },
    });

    if (!recording) {
      throw new NotFoundException(`Recording with ID ${id} not found`);
    }

    // Verify access
    if (currentUserRole === UserRole.PARENT) {
      const patient = await this.patientsService.findById(
        recording.patientExercise.patientId,
        currentUserId,
        currentUserRole,
      );
      if (!patient) {
        throw new ForbiddenException('You can only access recordings for your own child');
      }
    } else if (currentUserRole === UserRole.ORTHOPHONISTE) {
      await this.patientsService.findById(
        recording.patientExercise.patientId,
        currentUserId,
        currentUserRole,
      );
    }

    return recording;
  }

  /**
   * Update recording review status (Orthophoniste only)
   */
  async updateReview(
    id: string,
    updateRecordingReviewDto: UpdateRecordingReviewDto,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<Recording> {
    // Only orthophonistes can review
    if (currentUserRole !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can review recordings');
    }

    const recording = await this.findById(id, currentUserId, currentUserRole);

    recording.status = updateRecordingReviewDto.status;
    recording.reviewedAt = new Date();
    recording.reviewedBy = currentUserId;
    if (updateRecordingReviewDto.feedback) {
      recording.feedback = updateRecordingReviewDto.feedback;
    }

    return this.recordingRepository.save(recording);
  }

  /**
   * Delete a recording
   */
  async deleteRecording(
    id: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<void> {
    const recording = await this.findById(id, currentUserId, currentUserRole);

    // Check if user has permission
    if (currentUserRole === UserRole.PARENT) {
      const patient = await this.patientsService.findById(
        recording.patientExercise.patientId,
        currentUserId,
        currentUserRole,
      );
      if (!patient) {
        throw new ForbiddenException('You can only delete recordings for your own child');
      }
    }

    // Delete the file from MinIO
    try {
      await this.storageService.deleteFile(recording.recordingKey);
    } catch (error) {
      // Log error but continue with database deletion
      console.warn('Failed to delete file from storage:', error);
    }

    await this.recordingRepository.remove(recording);
  }

  /**
   * Get fresh presigned URL for a recording
   */
  async getFreshRecordingUrl(
    id: string,
    currentUserId: string,
    currentUserRole: string,
    expirySeconds: number = 604800, // 7 days default
  ): Promise<string> {
    const recording = await this.findById(id, currentUserId, currentUserRole);
    return this.storageService.getFileUrl(recording.recordingKey, expirySeconds);
  }

  /**
   * Transform to response DTO
   */
/**
 * Transform to response DTO
 */
toResponseDto(recording: Recording): any {
  // Get patient name from the relation
  const patient = recording.patientExercise?.patient;
  const exercise = recording.patientExercise?.exercise;
  
  const patientName = patient 
    ? `${patient.firstName} ${patient.lastName}` 
    : 'Unknown Patient';
    
  const exerciseTitle = exercise?.title || 'Unknown Exercise';

  return {
    id: recording.id,
    patientExerciseId: recording.patientExerciseId,
    recordingUrl: recording.recordingUrl,
    recordingKey: recording.recordingKey,
    duration: recording.duration,
    notes: recording.notes,
    status: recording.status,
    feedback: recording.feedback,
    reviewedAt: recording.reviewedAt,
    createdAt: recording.createdAt,
    updatedAt: recording.updatedAt,
    // Additional fields for admin dashboard
    patientName,
    exerciseTitle,
    patientId: patient?.id || null,
    exerciseId: exercise?.id || null,
  };
}}