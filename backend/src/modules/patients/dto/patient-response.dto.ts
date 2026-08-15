import { ApiProperty } from '@nestjs/swagger';
import { PatientStatus, Gender } from '../interfaces/patient-status.enum';
import { EmergencyContactDto } from './create-patient.dto';

export class PatientResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  dateOfBirth!: Date;

  @ApiProperty({ enum: Gender })
  gender!: Gender;

  @ApiProperty()
  parentId!: string;

  @ApiProperty()
  orthophonisteId!: string;

  @ApiProperty({ required: false })
  diagnosis?: string;

  @ApiProperty({ required: false })
  medicalHistory?: string;

  @ApiProperty({ required: false, type: [String] })
  allergies?: string[];

  @ApiProperty({ required: false, type: [String] })
  medications?: string[];

  @ApiProperty({ required: false, type: [String] })
  therapyGoals?: string[];

  @ApiProperty({ required: false })
  therapyFrequency?: string;

  @ApiProperty({ required: false })
  therapyDuration?: number;

  @ApiProperty({ required: false })
  emergencyContact?: EmergencyContactDto;

  @ApiProperty({ enum: PatientStatus })
  status!: PatientStatus;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  // Computed fields
  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  age!: number;
}