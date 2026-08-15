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
import { User } from '../../users/entities/user.entity';
import { PatientStatus, Gender } from '../interfaces/patient-status.enum';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

@Entity('patients')
@Index(['parentId', 'orthophonisteId'])
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: 'date' })
  dateOfBirth!: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.OTHER,
  })
  gender!: Gender;

  @Column({ type: 'uuid' })
  parentId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'parentId' })
  parent!: User;

  @Column({ type: 'uuid' })
  orthophonisteId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'orthophonisteId' })
  orthophoniste!: User;

  // Medical Information
  @Column({ nullable: true })
  diagnosis?: string;

  @Column({ nullable: true, type: 'text' })
  medicalHistory?: string;

  @Column({ nullable: true, type: 'jsonb' })
  allergies?: string[];

  @Column({ nullable: true, type: 'jsonb' })
  medications?: string[];

  // Therapy Information
  @Column({ nullable: true, type: 'jsonb' })
  therapyGoals?: string[];

  @Column({ nullable: true })
  therapyFrequency?: string;

  @Column({ nullable: true, type: 'int' })
  therapyDuration?: number;

  // Contact Information
  @Column({ nullable: true, type: 'jsonb' })
  emergencyContact?: EmergencyContact;

  // Status
  @Column({
    type: 'enum',
    enum: PatientStatus,
    default: PatientStatus.ACTIVE,
  })
  status!: PatientStatus;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}