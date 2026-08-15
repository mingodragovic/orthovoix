// src/modules/submissions/submissions.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto, UpdateSubmissionStatusDto } from './dto/update-submission.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';
import { SubmissionStatus } from './interfaces/submission-status.enum';
import { PatientsService } from '../patients/patients.service';
import { ExercisesService } from '../exercises/exercises.service';
import { PatientExercisesService } from '../patient-exercises/patient-exercises.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { StorageService } from '../storage/storage.service';
import { PatientExerciseStatus } from '../patient-exercises/interfaces/patient-exercise-status.enum';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    private patientsService: PatientsService,
    private exercisesService: ExercisesService,
    private patientExercisesService: PatientExercisesService,
    private usersService: UsersService,
    private storageService: StorageService,
  ) {}

  /**
   * Create a new submission with multiple answers (one per slide)
   */
  async create(
    createSubmissionDto: CreateSubmissionDto,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<Submission> {
    // Verify patient exercise exists
    const patientExercise = await this.patientExercisesService.findById(
      createSubmissionDto.patientExerciseId,
    );

    // Verify access to the patient
    await this.patientsService.findById(
      patientExercise.patientId,
      currentUserId,
      currentUserRole,
    );

    // Get the exercise to check slides
    const exercise = await this.exercisesService.findById(patientExercise.exerciseId);
    const expectedSlides = exercise.slides?.length || 0;

    // Validate that all slides have answers
    if (createSubmissionDto.answers.length !== expectedSlides) {
      throw new BadRequestException(
        `Expected ${expectedSlides} answers (one per slide), but received ${createSubmissionDto.answers.length}`
      );
    }

    // Validate that each answer has a unique slide index
    const slideIndices = createSubmissionDto.answers.map(a => a.slideIndex);
    const uniqueIndices = new Set(slideIndices);
    if (uniqueIndices.size !== slideIndices.length) {
      throw new BadRequestException('Duplicate slide indices found. Each slide must have one answer.');
    }

    // Validate that slide indices are within range
    const expectedIndices = Array.from({ length: expectedSlides }, (_, i) => i);
    const sortedIndices = [...slideIndices].sort((a, b) => a - b);
    if (sortedIndices.length !== expectedIndices.length || 
        sortedIndices.some((idx, i) => idx !== expectedIndices[i])) {
      throw new BadRequestException(
        `Slide indices must be 0 to ${expectedSlides - 1}. Received: ${slideIndices.sort((a,b) => a - b).join(', ')}`
      );
    }

    // Validate each answer's duration (max 10 seconds)
    for (const answer of createSubmissionDto.answers) {
      if (answer.duration && answer.duration > 10) {
        throw new BadRequestException(
          `Recording for slide ${answer.slideIndex} exceeds 10 seconds (${answer.duration.toFixed(2)} seconds)`
        );
      }
    }

    // Check if submission already exists for this patient-exercise
    const existingSubmission = await this.submissionRepository.findOne({
      where: {
        patientExerciseId: createSubmissionDto.patientExerciseId,
      },
    });

    if (existingSubmission) {
      throw new BadRequestException('A submission already exists for this exercise');
    }

    // Create the submission
    const submission = this.submissionRepository.create({
      patientExerciseId: createSubmissionDto.patientExerciseId,
      patientId: patientExercise.patientId,
      exerciseId: patientExercise.exerciseId,
      submittedBy: currentUserId,
      answers: createSubmissionDto.answers,
      metadata: {
        ...createSubmissionDto.metadata,
        submittedAt: new Date(),
      },
      notes: createSubmissionDto.notes,
      status: SubmissionStatus.PENDING,
      submittedAt: new Date(),
    });

    // Update the patient exercise status to completed
    await this.patientExercisesService.updateStatus(
      patientExercise.id,
      { status: PatientExerciseStatus.COMPLETED, notes: 'Exercise submitted' },
      currentUserId,
      currentUserRole,
    );

    return this.submissionRepository.save(submission);
  }

  /**
   * Get all submissions (Admin only)
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    patientId?: string,
    exerciseId?: string,
  ): Promise<{ items: Submission[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Submission> = {};

    if (status) {
      where.status = status as SubmissionStatus;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (exerciseId) {
      where.exerciseId = exerciseId;
    }

    const [items, total] = await this.submissionRepository.findAndCount({
      where,
      relations: {
        patient: true,
        exercise: true,
        patientExercise: true,
        submitter: true,
        reviewer: true,
      },
      skip,
      take: limit,
      order: { submittedAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get submissions for a specific patient
   */
  async findByPatient(
    patientId: string,
    currentUserId: string,
    currentUserRole: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: Submission[]; total: number; page: number; limit: number }> {
    await this.patientsService.findById(patientId, currentUserId, currentUserRole);

    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Submission> = { patientId };

    const [items, total] = await this.submissionRepository.findAndCount({
      where,
      relations: {
        patient: true,
        exercise: true,
        patientExercise: true,
        submitter: true,
        reviewer: true,
      },
      skip,
      take: limit,
      order: { submittedAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get submissions by parent (only their child's submissions)
   */
  async findByParent(
    parentId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: Submission[]; total: number; page: number; limit: number }> {
    const patient = await this.patientsService.findMyChild(parentId);

    if (!patient) {
      return {
        items: [],
        total: 0,
        page,
        limit,
      };
    }

    return this.findByPatient(patient.id, parentId, UserRole.PARENT, page, limit);
  }

  /**
   * Get a single submission by ID with permission check
   */
  async findById(
    id: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<Submission> {
    const submission = await this.submissionRepository.findOne({
      where: { id },
      relations: {
        patient: true,
        exercise: true,
        patientExercise: true,
        submitter: true,
        reviewer: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    if (currentUserRole === UserRole.PARENT) {
      const patient = await this.patientsService.findMyChild(currentUserId);
      if (!patient || patient.id !== submission.patientId) {
        throw new ForbiddenException('You can only view your own child\'s submissions');
      }
    }

    return submission;
  }

  /**
   * Update submission status (Admin only)
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateSubmissionStatusDto,
    currentUserId: string,
  ): Promise<Submission> {
    const submission = await this.submissionRepository.findOne({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    const user = await this.usersService.findById(currentUserId);
    if (user.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can review submissions');
    }

    submission.status = updateStatusDto.status;
    submission.reviewedBy = currentUserId;
    submission.reviewedAt = new Date();

    if (updateStatusDto.reviewNotes) {
      submission.reviewNotes = updateStatusDto.reviewNotes;
    }

    return this.submissionRepository.save(submission);
  }

  /**
   * Update submission (Admin only)
   */
  async update(
    id: string,
    updateSubmissionDto: UpdateSubmissionDto,
    currentUserId: string,
  ): Promise<Submission> {
    const submission = await this.submissionRepository.findOne({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    const user = await this.usersService.findById(currentUserId);
    if (user.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can update submissions');
    }

    if (updateSubmissionDto.status) {
      submission.status = updateSubmissionDto.status;
      submission.reviewedBy = currentUserId;
      submission.reviewedAt = new Date();
    }

    if (updateSubmissionDto.reviewNotes) {
      submission.reviewNotes = updateSubmissionDto.reviewNotes;
    }

    if (updateSubmissionDto.notes) {
      submission.notes = updateSubmissionDto.notes;
    }

    return this.submissionRepository.save(submission);
  }

  /**
   * Delete submission (Admin only)
   */
  async delete(id: string, currentUserId: string): Promise<void> {
    const submission = await this.submissionRepository.findOne({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    const user = await this.usersService.findById(currentUserId);
    if (user.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can delete submissions');
    }

    await this.submissionRepository.remove(submission);
  }


/**
 * Transform submission to response DTO with fresh presigned URLs and slide names
 */
async toResponseDto(submission: Submission): Promise<SubmissionResponseDto> {
  // Get the exercise to access slide names
  const exercise = await this.exercisesService.findById(submission.exerciseId);
  const slides = exercise?.slides || [];

  // Process answers - generate URLs for each recording and add slide name
  const answersWithUrls = await Promise.all(
    (submission.answers || []).map(async (answer) => {
      let recordedAudioUrl: string | undefined;

      if (answer.recordedAudioKey) {
        try {
          recordedAudioUrl = await this.storageService.getFileUrl(
            answer.recordedAudioKey,
            3600,
          );
        } catch (error) {
          // If file not found, leave undefined
        }
      }

      // Find the slide name from the exercise slides
      const slide = slides.find((s) => s.order === answer.slideIndex || s.order === answer.slideIndex);
      const slideName = slide?.name || `Slide ${answer.slideIndex + 1}`;

      return {
        ...answer,
        slideName,  // ✅ NEW: Add slide name
        recordedAudioUrl,
      };
    }),
  );

  return {
    id: submission.id,
    patientExerciseId: submission.patientExerciseId,
    patientId: submission.patientId,
    patientName: submission.patient
      ? `${submission.patient.firstName} ${submission.patient.lastName}`
      : 'Unknown',
    exerciseId: submission.exerciseId,
    exerciseTitle: submission.exercise?.title || 'Unknown',
    submittedBy: submission.submittedBy,
    submitterName: submission.submitter?.name || 'Unknown',
    answers: answersWithUrls,
    metadata: submission.metadata,
    status: submission.status,
    notes: submission.notes,
    submittedAt: submission.submittedAt,
    reviewedAt: submission.reviewedAt,
    reviewedBy: submission.reviewedBy,
    reviewerName: submission.reviewer?.name || 'Unknown',
    reviewNotes: submission.reviewNotes,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
}
  /**
   * Get submission statistics for a patient
   */
  async getPatientStats(patientId: string): Promise<any> {
    const submissions = await this.submissionRepository.find({
      where: { patientId },
    });

    const totalSubmissions = submissions.length;
    const pendingSubmissions = submissions.filter(
      (s) => s.status === SubmissionStatus.PENDING,
    ).length;
    const reviewedSubmissions = submissions.filter(
      (s) => s.status === SubmissionStatus.REVIEWED,
    ).length;
    const approvedSubmissions = submissions.filter(
      (s) => s.status === SubmissionStatus.APPROVED,
    ).length;
    const needsImprovement = submissions.filter(
      (s) => s.status === SubmissionStatus.NEEDS_IMPROVEMENT,
    ).length;
    const rejectedSubmissions = submissions.filter(
      (s) => s.status === SubmissionStatus.REJECTED,
    ).length;

    return {
      totalSubmissions,
      pendingSubmissions,
      reviewedSubmissions,
      approvedSubmissions,
      needsImprovement,
      rejectedSubmissions,
      completionRate: totalSubmissions > 0 
        ? Math.round((approvedSubmissions / totalSubmissions) * 100) 
        : 0,
    };
  }
}