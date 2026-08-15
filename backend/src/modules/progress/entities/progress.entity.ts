// src/modules/progress/entities/progress.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../users/entities/user.entity';
import { ProgressType } from '../interfaces/progress-type.enum';

export interface AssessmentScores {
  pronunciationScore?: number;   // 0-100
  vocabularyScore?: number;      // 0-100
  grammarScore?: number;         // 0-100
  comprehensionScore?: number;   // 0-100
  fluencyScore?: number;         // 0-100
  articulationScore?: number;    // 0-100
  phonologyScore?: number;       // 0-100
  languageScore?: number;        // 0-100
  socialCommunicationScore?: number; // 0-100
  overallScore?: number;         // Average
}

export interface Goal {
  description: string;
  status: 'not-started' | 'in-progress' | 'achieved' | 'abandoned';
  targetDate?: Date;
  achievedDate?: Date;
  notes?: string;
}

@Entity('progress_records')
@Index(['patientId', 'recordDate'])
@Index(['patientId', 'type'])
export class Progress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @Column({ type: 'uuid' })
  recordedBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recordedBy' })
  recorder!: User;

  @Column({ type: 'timestamp' })
  recordDate!: Date;

  @Column({
    type: 'enum',
    enum: ProgressType,
    default: ProgressType.OVERALL,
  })
  type!: ProgressType;

  // Assessment Scores
  @Column({ nullable: true, type: 'jsonb' })
  scores?: AssessmentScores;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @Column({ nullable: true, type: 'jsonb' })
  strengths?: string[];

  @Column({ nullable: true, type: 'jsonb' })
  areasForImprovement?: string[];

  @Column({ nullable: true, type: 'jsonb' })
  nextGoals?: Goal[];

  @Column({ nullable: true, type: 'text' })
  therapyPlanAdjustments?: string;

  @Column({ nullable: true })
  recommendedFrequency?: string;

  @Column({ nullable: true, type: 'int' })
  therapyDuration?: number; // in months

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}