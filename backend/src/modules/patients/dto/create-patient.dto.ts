import { ApiProperty } from '@nestjs/swagger';
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
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PatientStatus, Gender } from '../interfaces/patient-status.enum';

export class EmergencyContactDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Father' })
  @IsString()
  @IsNotEmpty()
  relationship!: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}

export class CreatePatientDto {
  @ApiProperty({ example: 'Emma' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Martin' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: '2018-05-15' })
  @IsDate()
  @Type(() => Date)
  dateOfBirth!: Date;

  @ApiProperty({ enum: Gender, example: Gender.FEMALE })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiProperty({ example: '84cb29f4-0cf7-4182-80f0-5d9f56fe6578' })
  @IsUUID()
  @IsNotEmpty()
  parentId!: string;

  @ApiProperty({ example: '84cb29f4-0cf7-4182-80f0-5d9f56fe6578' })
  @IsUUID()
  @IsNotEmpty()
  orthophonisteId!: string;

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

  @ApiProperty({ enum: PatientStatus, default: PatientStatus.ACTIVE })
  @IsEnum(PatientStatus)
  status!: PatientStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}