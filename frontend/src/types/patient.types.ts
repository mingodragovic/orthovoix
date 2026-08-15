// src/types/patient.types.ts
export type Gender = 'male' | 'female' | 'other';
export type PatientStatus = 'active' | 'inactive' | 'discharged';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  parentId: string;
  orthophonisteId: string;
  diagnosis?: string;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  therapyGoals?: string[];
  therapyFrequency?: string;
  therapyDuration?: number;
  emergencyContact: EmergencyContact;
  status: PatientStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  age: number;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  parentId: string;
  orthophonisteId: string;
  diagnosis?: string;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  therapyGoals?: string[];
  therapyFrequency?: string;
  therapyDuration?: number;
  emergencyContact: EmergencyContact;
  status?: PatientStatus;
  notes?: string;
}

export interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  parentId?: string;
  orthophonisteId?: string;
  diagnosis?: string;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  therapyGoals?: string[];
  therapyFrequency?: string;
  therapyDuration?: number;
  emergencyContact?: EmergencyContact;
  status?: PatientStatus;
  notes?: string;
}

export interface PatientFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: PatientStatus;
}

export interface PatientsResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    items: Patient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PatientResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: Patient;
}

export interface PatientExercisesResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    patientId: string;
    exercises: any[];
    message: string;
  };
}

export interface PatientProgressResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    patientId: string;
    progress: any[];
    message: string;
  };
}