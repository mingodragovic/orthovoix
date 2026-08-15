// src/modules/patients/dto/update-patient.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsEnum,
  IsUUID,
  IsOptional,
  IsArray,
  IsObject,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PatientStatus, Gender } from '../interfaces/patient-status.enum';
import { EmergencyContactDto } from './create-patient.dto';

export class UpdatePatientDto {
  @ApiProperty({ required: false, example: 'Emma' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false, example: 'Martin' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, example: '2018-05-15' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @ApiProperty({ required: false, enum: Gender, example: Gender.FEMALE })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ required: false, example: '84cb29f4-0cf7-4182-80f0-5d9f56fe6578' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ required: false, example: '84cb29f4-0cf7-4182-80f0-5d9f56fe6578' })
  @IsOptional()
  @IsUUID()
  orthophonisteId?: string;

  @ApiProperty({ required: false, example: 'Speech delay' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({ required: false, example: 'No significant medical history' })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @ApiProperty({ required: false, example: ['Peanuts', 'Dust'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiProperty({ required: false, example: ['Albuterol'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @ApiProperty({ required: false, example: ['Improve pronunciation', 'Expand vocabulary'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  therapyGoals?: string[];

  @ApiProperty({ required: false, example: '2x per week' })
  @IsOptional()
  @IsString()
  therapyFrequency?: string;

  @ApiProperty({ required: false, example: 6 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  therapyDuration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @ApiProperty({ required: false, enum: PatientStatus })
  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}