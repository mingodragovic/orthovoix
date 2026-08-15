// src/modules/patient-exercises/patient-exercises.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations, Between, LessThan, MoreThan } from 'typeorm';
import { PatientExercise } from './entities/patient-exercise.entity';
import { AssignExerciseDto } from './dto/assign-exercise.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { PatientExerciseResponseDto } from './dto/patient-exercise-response.dto';
import { PatientExerciseStatus, PriorityLevel } from './interfaces/patient-exercise-status.enum';
import { PatientsService } from '../patients/patients.service';
import { ExercisesService } from '../exercises/exercises.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/interfaces/user-roles.enum';

@Injectable()
export class PatientExercisesService {
  constructor(
    @InjectRepository(PatientExercise)
    private patientExerciseRepository: Repository<PatientExercise>,
    private patientsService: PatientsService,
    private exercisesService: ExercisesService,
    private usersService: UsersService,
  ) {}

  /**
   * Assign an exercise to a patient
   */
  async assignExercise(
    assignExerciseDto: AssignExerciseDto,
    currentUserId: string,
  ): Promise<PatientExercise> {
    // Verify patient exists
    const patient = await this.patientsService.findById(
      assignExerciseDto.patientId,
      currentUserId,
      UserRole.ORTHOPHONISTE,
    );

    // Verify exercise exists
    const exercise = await this.exercisesService.findById(assignExerciseDto.exerciseId);

    // Verify the user is an orthophoniste
    const user = await this.usersService.findById(currentUserId);
    if (user.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can assign exercises');
    }

    // Check if this exercise is already assigned to this patient
    const existingAssignment = await this.patientExerciseRepository.findOne({
      where: {
        patientId: assignExerciseDto.patientId,
        exerciseId: assignExerciseDto.exerciseId,
        status: PatientExerciseStatus.ASSIGNED,
      },
    });

    if (existingAssignment) {
      throw new BadRequestException('This exercise is already assigned to this patient');
    }

    // Create the assignment
    const patientExercise = this.patientExerciseRepository.create({
      patientId: assignExerciseDto.patientId,
      exerciseId: assignExerciseDto.exerciseId,
      assignedBy: currentUserId,
      assignedDate: new Date(),
      dueDate: assignExerciseDto.dueDate ? new Date(assignExerciseDto.dueDate) : undefined,
      priority: assignExerciseDto.priority || PriorityLevel.MEDIUM,
      notes: assignExerciseDto.notes || '',
      status: PatientExerciseStatus.ASSIGNED,
      progressLogs: [
        {
          date: new Date(),
          status: 'assigned',
          notes: `Exercise assigned by ${user.name}`,
        },
      ],
    });

    return this.patientExerciseRepository.save(patientExercise);
  }

  /**
   * Get all exercises for a specific patient
   */
  async getPatientExercises(
    patientId: string,
    currentUserId: string,
    currentUserRole: string,
    status?: string,
  ): Promise<PatientExercise[]> {
    // Verify patient exists and user has access
    await this.patientsService.findById(patientId, currentUserId, currentUserRole);

    const where: any = { patientId };

    if (status) {
      where.status = status;
    }

    const relations: FindOptionsRelations<PatientExercise> = {
      patient: true,
      exercise: true,
      assigner: true,
    };

    return this.patientExerciseRepository.find({
      where,
      relations,
      order: { assignedDate: 'DESC' },
    });
  }

  /**
   * Update exercise status
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<PatientExercise> {
    const patientExercise = await this.findById(id);

    // Verify access to the patient
    await this.patientsService.findById(
      patientExercise.patientId,
      currentUserId,
      currentUserRole,
    );

    // If marking as completed, set completed date
    if (updateStatusDto.status === PatientExerciseStatus.COMPLETED) {
      patientExercise.completedDate = new Date();
    }

    // If marking as in-progress from assigned, add progress log
    if (
      updateStatusDto.status === PatientExerciseStatus.IN_PROGRESS &&
      patientExercise.status === PatientExerciseStatus.ASSIGNED
    ) {
      const progressLogs = patientExercise.progressLogs || [];
      progressLogs.push({
        date: new Date(),
        status: 'in-progress',
        notes: updateStatusDto.notes || 'Started working on the exercise',
      });
      patientExercise.progressLogs = progressLogs;
    }

    // If marking as completed, add progress log
    if (updateStatusDto.status === PatientExerciseStatus.COMPLETED) {
      const progressLogs = patientExercise.progressLogs || [];
      progressLogs.push({
        date: new Date(),
        status: 'completed',
        notes: updateStatusDto.notes || 'Exercise completed',
      });
      patientExercise.progressLogs = progressLogs;
    }

    patientExercise.status = updateStatusDto.status;
    if (updateStatusDto.notes) {
      patientExercise.notes = updateStatusDto.notes;
    }

    return this.patientExerciseRepository.save(patientExercise);
  }

  /**
   * Update exercise progress (performance and logs)
   */
  async updateProgress(
    id: string,
    updateProgressDto: UpdateProgressDto,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<PatientExercise> {
    const patientExercise = await this.findById(id);

    // Verify access to the patient
    await this.patientsService.findById(
      patientExercise.patientId,
      currentUserId,
      currentUserRole,
    );

    // Update performance
    if (updateProgressDto.performance) {
      patientExercise.performance = {
        ...patientExercise.performance,
        ...updateProgressDto.performance,
      };
    }

    // Add progress log
    if (updateProgressDto.progressLog) {
      const progressLogs = patientExercise.progressLogs || [];
      progressLogs.push({
        date: new Date(),
        ...updateProgressDto.progressLog,
        status: 'updated',
      });
      patientExercise.progressLogs = progressLogs;

      // If score is provided and current status is not completed, update status to in-progress
      if (
        updateProgressDto.progressLog.score !== undefined &&
        updateProgressDto.progressLog.score !== null &&
        patientExercise.status === PatientExerciseStatus.ASSIGNED
      ) {
        patientExercise.status = PatientExerciseStatus.IN_PROGRESS;
      }

      // If score is 100, automatically mark as completed
      if (updateProgressDto.progressLog.score === 100) {
        patientExercise.status = PatientExerciseStatus.COMPLETED;
        patientExercise.completedDate = new Date();
      }
    }

    return this.patientExerciseRepository.save(patientExercise);
  }

  /**
   * Get a single patient-exercise assignment by ID
   */
  async findById(id: string): Promise<PatientExercise> {
    const relations: FindOptionsRelations<PatientExercise> = {
      patient: true,
      exercise: true,
      assigner: true,
    };

    const patientExercise = await this.patientExerciseRepository.findOne({
      where: { id },
      relations,
    });

    if (!patientExercise) {
      throw new NotFoundException(`Patient exercise assignment with ID ${id} not found`);
    }

    return patientExercise;
  }

  /**
   * Get patient progress summary
   */
  async getPatientProgressSummary(
    patientId: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<any> {
    // Verify patient exists and user has access
    await this.patientsService.findById(patientId, currentUserId, currentUserRole);

    const allAssignments = await this.patientExerciseRepository.find({
      where: { patientId },
      relations: { exercise: true },
    });

    const totalExercises = allAssignments.length;
    const completedExercises = allAssignments.filter(
      a => a.status === PatientExerciseStatus.COMPLETED,
    ).length;
    const inProgressExercises = allAssignments.filter(
      a => a.status === PatientExerciseStatus.IN_PROGRESS,
    ).length;
    const overdueExercises = allAssignments.filter(
      a => a.status === PatientExerciseStatus.OVERDUE,
    ).length;

    // Calculate average score
    const scores = allAssignments
      .filter(a => a.performance?.score !== undefined)
      .map(a => a.performance!.score!);
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    // Get recent progress logs
    const recentLogs = allAssignments
      .flatMap(a => a.progressLogs || [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    // Group exercises by category
    const categoryBreakdown: { [key: string]: number } = {};
    allAssignments.forEach(a => {
      const category = a.exercise?.category || 'unknown';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    });

    return {
      patientId,
      summary: {
        totalExercises,
        completedExercises,
        inProgressExercises,
        overdueExercises,
        completionRate: totalExercises > 0
          ? Math.round((completedExercises / totalExercises) * 100)
          : 0,
        averageScore,
      },
      categoryBreakdown,
      recentLogs,
    };
  }

  /**
   * Check for overdue exercises (to be called by a cron job)
   */
  async updateOverdueStatus(): Promise<void> {
    const now = new Date();
    const overdueAssignments = await this.patientExerciseRepository.find({
      where: {
        dueDate: LessThan(now),
        status: PatientExerciseStatus.ASSIGNED,
      },
    });

    for (const assignment of overdueAssignments) {
      assignment.status = PatientExerciseStatus.OVERDUE;
      await this.patientExerciseRepository.save(assignment);
    }
  }

/**
 * Get all patient-exercise assignments (Orthophoniste only)
 * With pagination and optional filters
 */
async findAllAssignments(
  page: number = 1,
  limit: number = 10,
  status?: string,
  patientId?: string,
  exerciseId?: string,
): Promise<{ items: PatientExercise[]; total: number; page: number; limit: number }> {
  const skip = (page - 1) * limit;
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (patientId) {
    where.patientId = patientId;
  }

  if (exerciseId) {
    where.exerciseId = exerciseId;
  }

  const relations: FindOptionsRelations<PatientExercise> = {
    patient: true,
    exercise: true,
    assigner: true,
  };

  const [items, total] = await this.patientExerciseRepository.findAndCount({
    where,
    relations,
    skip,
    take: limit,
    order: { assignedDate: 'DESC' },
  });

  return {
    items,
    total,
    page,
    limit,
  };
}
  /**
 * Transform to response DTO
 */
toResponseDto(patientExercise: PatientExercise): PatientExerciseResponseDto {
  const daysSinceAssigned = Math.floor(
    (new Date().getTime() - new Date(patientExercise.assignedDate).getTime()) /
    (1000 * 60 * 60 * 24),
  );

  let daysUntilDue: number | undefined;
  if (patientExercise.dueDate) {
    daysUntilDue = Math.ceil(
      (new Date(patientExercise.dueDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
    );
  }

  // Generate cover image URL if exercise has cover image key
  let coverImageUrl: string | undefined;
  if (patientExercise.exercise?.coverImageKey) {
    // Note: This would need StorageService injected to generate URL
    // For now, we'll generate it in the controller or add storage service here
  }

  return {
    id: patientExercise.id,
    patientId: patientExercise.patientId,
    patientName: patientExercise.patient
      ? `${patientExercise.patient.firstName} ${patientExercise.patient.lastName}`
      : 'Unknown',
    exerciseId: patientExercise.exerciseId,
    exerciseTitle: patientExercise.exercise?.title || 'Unknown',
    exerciseCategory: patientExercise.exercise?.category || 'unknown',
    coverImageUrl: coverImageUrl,
    assignedBy: patientExercise.assignedBy,
    assignerName: patientExercise.assigner?.name || 'Unknown',
    assignedDate: patientExercise.assignedDate,
    dueDate: patientExercise.dueDate,
    completedDate: patientExercise.completedDate,
    status: patientExercise.status,
    priority: patientExercise.priority,
    notes: patientExercise.notes,
    performance: patientExercise.performance,
    progressLogs: patientExercise.progressLogs,
    daysSinceAssigned,
    daysUntilDue,
    createdAt: patientExercise.createdAt,
    updatedAt: patientExercise.updatedAt,
  };
}
}