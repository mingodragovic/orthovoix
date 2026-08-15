// src/modules/appointments/entities/appointment.entity.ts
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
import { AppointmentStatus, AppointmentType } from '../interfaces/appointment-status.enum';

export interface SessionNote {
  date: Date;
  notes: string;
  duration?: number; // Minutes
  topics?: string[];
  progress?: string;
  nextSteps?: string;
}

@Entity('appointments')
@Index(['patientId', 'dateTime'])
@Index(['orthophonisteId', 'dateTime'])
@Index(['status', 'dateTime'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @Column({ type: 'uuid' })
  orthophonisteId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'orthophonisteId' })
  orthophoniste!: User;

  @Column({ type: 'timestamp' })
  dateTime!: Date;

  @Column({ type: 'int' })
  duration!: number; // Duration in minutes

  @Column({
    type: 'enum',
    enum: AppointmentType,
    default: AppointmentType.THERAPY_SESSION,
  })
  type!: AppointmentType;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status!: AppointmentStatus;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @Column({ nullable: true, type: 'jsonb' })
  sessionNotes?: SessionNote[];

  @Column({ nullable: true })
  cancellationReason?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  meetingLink?: string;

  @Column({ nullable: true })
  isVirtual?: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  reminderSentAt?: Date;

  @Column({ default: false })
  reminderSent!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}