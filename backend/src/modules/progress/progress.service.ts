// src/modules/progress/progress.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations, Between, LessThan, MoreThan } from 'typeorm';
import { Progress } from './entities/progress.entity';
import { CreateProgressDto, GoalDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ProgressResponseDto } from './dto/progress-response.dto';
import { ProgressType } from './interfaces/progress-type.enum';
import { PatientsService } from '../patients/patients.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/interfaces/user-roles.enum';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    private patientsService: PatientsService,
    private usersService: UsersService,
  ) {}

  /**
   * Record progress for a patient
   */
async createProgress(
  createProgressDto: CreateProgressDto,
  currentUserId: string,
): Promise<Progress> {
  // Verify patient exists and user has access
  // Use the patientId from the DTO
  const patient = await this.patientsService.findById(
    createProgressDto.patientId!,  // Now this will be set
    currentUserId,
    UserRole.ORTHOPHONISTE,
  );

    // Verify the user is an orthophoniste
    const user = await this.usersService.findById(currentUserId);
    if (user.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can record progress');
    }

    // Calculate overall score if not provided
    if (createProgressDto.scores && !createProgressDto.scores.overallScore) {
      const scores = createProgressDto.scores;
      const scoreValues = [
        scores.pronunciationScore,
        scores.vocabularyScore,
        scores.grammarScore,
        scores.comprehensionScore,
        scores.fluencyScore,
        scores.articulationScore,
        scores.phonologyScore,
        scores.languageScore,
        scores.socialCommunicationScore,
      ].filter(s => s !== undefined && s !== null) as number[];

      if (scoreValues.length > 0) {
        const average = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
        createProgressDto.scores.overallScore = Math.round(average);
      }
    }

    // Convert GoalDto[] to proper format for storage
    const nextGoals = createProgressDto.nextGoals?.map((goal: GoalDto) => ({
      description: goal.description,
      status: goal.status as 'not-started' | 'in-progress' | 'achieved' | 'abandoned',
      targetDate: goal.targetDate,
      achievedDate: goal.achievedDate,
      notes: goal.notes,
    }));

    const progress = this.progressRepository.create({
      patientId: createProgressDto.patientId,
      recordedBy: currentUserId,
      recordDate: createProgressDto.recordDate || new Date(),
      type: createProgressDto.type || ProgressType.OVERALL,
      scores: createProgressDto.scores,
      notes: createProgressDto.notes,
      strengths: createProgressDto.strengths,
      areasForImprovement: createProgressDto.areasForImprovement,
      nextGoals: nextGoals || [],
      therapyPlanAdjustments: createProgressDto.therapyPlanAdjustments,
      recommendedFrequency: createProgressDto.recommendedFrequency,
      therapyDuration: createProgressDto.therapyDuration,
    });

    return this.progressRepository.save(progress);
  }

  /**
   * Get all progress records for a patient
   */
  async getPatientProgress(
    patientId: string,
    currentUserId: string,
    currentUserRole: string,
    type?: string,
    limit?: number,
  ): Promise<Progress[]> {
    // Verify patient exists and user has access
    await this.patientsService.findById(patientId, currentUserId, currentUserRole);

    const where: any = { patientId };

    if (type) {
      where.type = type;
    }

    const relations: FindOptionsRelations<Progress> = {
      patient: true,
      recorder: true,
    };

    const query = this.progressRepository.find({
      where,
      relations,
      order: { recordDate: 'DESC' },
    });

    if (limit && limit > 0) {
      return (await query).slice(0, limit);
    }

    return query;
  }

  /**
   * Get a single progress record by ID
   */
  async findById(id: string, currentUserId: string, currentUserRole: string): Promise<Progress> {
    const relations: FindOptionsRelations<Progress> = {
      patient: true,
      recorder: true,
    };

    const progress = await this.progressRepository.findOne({
      where: { id },
      relations,
    });

    if (!progress) {
      throw new NotFoundException(`Progress record with ID ${id} not found`);
    }

    // Verify access to the patient
    await this.patientsService.findById(
      progress.patientId,
      currentUserId,
      currentUserRole,
    );

    return progress;
  }

  /**
   * Update a progress record
   */
  async updateProgress(
    id: string,
    updateProgressDto: UpdateProgressDto,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<Progress> {
    const progress = await this.findById(id, currentUserId, currentUserRole);

    // Only orthophonistes can update
    const user = await this.usersService.findById(currentUserId);
    if (user.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can update progress records');
    }

    // Calculate overall score if scores are updated and overall not provided
    if (updateProgressDto.scores && !updateProgressDto.scores.overallScore) {
      const scores = updateProgressDto.scores;
      const scoreValues = [
        scores.pronunciationScore,
        scores.vocabularyScore,
        scores.grammarScore,
        scores.comprehensionScore,
        scores.fluencyScore,
        scores.articulationScore,
        scores.phonologyScore,
        scores.languageScore,
        scores.socialCommunicationScore,
      ].filter(s => s !== undefined && s !== null) as number[];

      if (scoreValues.length > 0) {
        const average = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
        updateProgressDto.scores.overallScore = Math.round(average);
      }
    }

    // Convert GoalDto[] to proper format if provided
    let nextGoals = progress.nextGoals;
    if (updateProgressDto.nextGoals) {
      nextGoals = updateProgressDto.nextGoals.map((goal: any) => ({
        description: goal.description,
        status: goal.status as 'not-started' | 'in-progress' | 'achieved' | 'abandoned',
        targetDate: goal.targetDate,
        achievedDate: goal.achievedDate,
        notes: goal.notes,
      }));
    }

    // Remove undefined values
    const updateData: any = { ...updateProgressDto };
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // If nextGoals is defined, use the converted version
    if (nextGoals !== progress.nextGoals) {
      updateData.nextGoals = nextGoals;
    }

    Object.assign(progress, updateData);
    return this.progressRepository.save(progress);
  }

  /**
   * Delete a progress record
   */
  async deleteProgress(
    id: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<void> {
    const progress = await this.findById(id, currentUserId, currentUserRole);

    // Only orthophonistes can delete
    const user = await this.usersService.findById(currentUserId);
    if (user.role !== UserRole.ORTHOPHONISTE) {
      throw new ForbiddenException('Only orthophonistes can delete progress records');
    }

    await this.progressRepository.remove(progress);
  }

  /**
   * Get progress summary for a patient
   */
  async getProgressSummary(
    patientId: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<any> {
    // Verify patient exists and user has access
    await this.patientsService.findById(patientId, currentUserId, currentUserRole);

    const allRecords = await this.progressRepository.find({
      where: { patientId },
      relations: { recorder: true },
      order: { recordDate: 'DESC' },
    });

    if (allRecords.length === 0) {
      return {
        patientId,
        totalRecords: 0,
        message: 'No progress records found',
      };
    }

    // Calculate average scores by type
    const typeScores: { [key: string]: number[] } = {};
    const overallScores: number[] = [];

    allRecords.forEach(record => {
      if (record.scores) {
        // Overall scores
        if (record.scores.overallScore !== undefined) {
          overallScores.push(record.scores.overallScore);
        }

        // Scores by type
        const type = record.type || 'overall';
        if (!typeScores[type]) {
          typeScores[type] = [];
        }

        // Get the specific score for this type
        const scoreMap: { [key: string]: number | undefined } = {
          [ProgressType.PRONUNCIATION]: record.scores.pronunciationScore,
          [ProgressType.VOCABULARY]: record.scores.vocabularyScore,
          [ProgressType.GRAMMAR]: record.scores.grammarScore,
          [ProgressType.COMPREHENSION]: record.scores.comprehensionScore,
          [ProgressType.FLUENCY]: record.scores.fluencyScore,
          [ProgressType.ARTICULATION]: record.scores.articulationScore,
          [ProgressType.PHONOLOGY]: record.scores.phonologyScore,
          [ProgressType.LANGUAGE]: record.scores.languageScore,
          [ProgressType.SOCIAL_COMMUNICATION]: record.scores.socialCommunicationScore,
          [ProgressType.OVERALL]: record.scores.overallScore,
        };

        const score = scoreMap[type];
        if (score !== undefined) {
          typeScores[type].push(score);
        }
      }
    });

    // Calculate averages
    const averageScores: { [key: string]: number } = {};
    Object.keys(typeScores).forEach(type => {
      const scores = typeScores[type];
      averageScores[type] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    });

    // Calculate trends (last 5 records)
    const recentRecords = allRecords.slice(0, 5);
    const trend = recentRecords.map(record => ({
      date: record.recordDate,
      overallScore: record.scores?.overallScore || null,
      type: record.type,
    }));

    // Get strengths and areas for improvement
    const allStrengths = allRecords.flatMap(r => r.strengths || []);
    const allAreas = allRecords.flatMap(r => r.areasForImprovement || []);
    const allGoals = allRecords.flatMap(r => r.nextGoals || []);

    // Count goal statuses
    const goalStatusCount: { [key: string]: number } = {
      'not-started': 0,
      'in-progress': 0,
      'achieved': 0,
      'abandoned': 0,
    };
    allGoals.forEach(goal => {
      if (goalStatusCount[goal.status] !== undefined) {
        goalStatusCount[goal.status]++;
      }
    });

    // Most recent record
    const latestRecord = allRecords[0];

    return {
      patientId,
      totalRecords: allRecords.length,
      summary: {
        latestOverallScore: latestRecord.scores?.overallScore || null,
        averageOverallScore: averageScores[ProgressType.OVERALL] || null,
        averageScores,
        totalGoals: allGoals.length,
        achievedGoals: goalStatusCount.achieved || 0,
        goalCompletionRate: allGoals.length > 0
          ? Math.round((goalStatusCount.achieved || 0) / allGoals.length * 100)
          : 0,
      },
      trends: trend,
      commonStrengths: this.getTopItems(allStrengths, 5),
      commonAreasForImprovement: this.getTopItems(allAreas, 5),
      goalStatusCount,
      latestNotes: latestRecord.notes || null,
    };
  }

  /**
   * Get progress chart data for visualization
   */
  async getChartData(
    patientId: string,
    currentUserId: string,
    currentUserRole: string,
    type?: string,
  ): Promise<any> {
    // Verify patient exists and user has access
    await this.patientsService.findById(patientId, currentUserId, currentUserRole);

    const where: any = { patientId };
    if (type) {
      where.type = type;
    }

    const records = await this.progressRepository.find({
      where,
      order: { recordDate: 'ASC' },
    });

    if (records.length === 0) {
      return {
        patientId,
        labels: [],
        datasets: [],
        message: 'No data available for chart',
      };
    }

    // Prepare data for chart.js format
    const labels = records.map(r => new Date(r.recordDate).toLocaleDateString());

    // Get all score types present
    const scoreTypes = new Set<string>();
    records.forEach(r => {
      if (r.scores) {
        Object.keys(r.scores).forEach(key => {
          if (r.scores && r.scores[key as keyof typeof r.scores] !== undefined) {
            scoreTypes.add(key);
          }
        });
      }
    });

    // Build datasets for each score type
    const datasets: Array<{
      label: string;
      data: (number | null)[];
      borderColor: string;
      backgroundColor: string;
    }> = [];

    const colors = [
      '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336',
      '#00BCD4', '#8BC34A', '#FF5722', '#795548', '#607D8B',
    ];

    let colorIndex = 0;
    scoreTypes.forEach(scoreType => {
      const data = records.map(r => {
        if (r.scores) {
          return r.scores[scoreType as keyof typeof r.scores] || null;
        }
        return null;
      });

      // Only add dataset if there's at least one non-null value
      if (data.some(v => v !== null)) {
        const color = colors[colorIndex % colors.length];
        datasets.push({
          label: this.formatLabel(scoreType),
          data,
          borderColor: color,
          backgroundColor: color + '33', // Add transparency
        });
        colorIndex++;
      }
    });

    return {
      patientId,
      labels,
      datasets,
    };
  }

  /**
   * Helper: Get top N items from an array
   */
  private getTopItems(items: string[], limit: number): string[] {
    const counts: { [key: string]: number } = {};
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item]) => item);
  }

  /**
   * Helper: Format label for display
   */
  private formatLabel(label: string): string {
    const labelMap: { [key: string]: string } = {
      pronunciationScore: 'Pronunciation',
      vocabularyScore: 'Vocabulary',
      grammarScore: 'Grammar',
      comprehensionScore: 'Comprehension',
      fluencyScore: 'Fluency',
      articulationScore: 'Articulation',
      phonologyScore: 'Phonology',
      languageScore: 'Language',
      socialCommunicationScore: 'Social Communication',
      overallScore: 'Overall',
    };
    return labelMap[label] || label;
  }

  /**
   * Transform to response DTO
   */
  toResponseDto(progress: Progress): ProgressResponseDto {
    return {
      id: progress.id,
      patientId: progress.patientId,
      patientName: progress.patient
        ? `${progress.patient.firstName} ${progress.patient.lastName}`
        : 'Unknown',
      recordedBy: progress.recordedBy,
      recorderName: progress.recorder?.name || 'Unknown',
      recordDate: progress.recordDate,
      type: progress.type,
      scores: progress.scores,
      notes: progress.notes,
      strengths: progress.strengths,
      areasForImprovement: progress.areasForImprovement,
      nextGoals: progress.nextGoals,
      therapyPlanAdjustments: progress.therapyPlanAdjustments,
      recommendedFrequency: progress.recommendedFrequency,
      therapyDuration: progress.therapyDuration,
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt,
    };
  }
}