// src/types/recording.types.ts

export enum RecordingStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  NEEDS_IMPROVEMENT = 'needs-improvement',
  GREAT = 'great',
}

export interface RecordingResponseDto {
  id: string;
  patientId: string;
  patientExerciseId: string;
  recordingUrl: string;
  recordingKey: string;
  duration: number;
  notes?: string;
  status: RecordingStatus;
  feedback?: string;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface CreateRecordingDto {
  recordingUrl: string;
  recordingKey: string;
  duration: number;
  notes?: string;
}

export interface UpdateRecordingReviewDto {
  status: RecordingStatus;
  feedback?: string;
}

export interface UploadRecordingResponseDto {
  url: string;
  key: string;
  bucket: string;
  patientId: string;
  exerciseId: string;
  assignmentId: string;
}

export interface PatientRecordingsResponseDto {
  patientId: string;
  recordings: RecordingResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PatientExerciseResponseDto {
  id: string;
  patientId: string;
  patientName: string;
  exerciseId: string;
  exerciseTitle: string;
  exerciseCategory: string;
  assignedBy: string;
  assignerName: string;
  assignedDate: string;
  dueDate: string | null;
  completedDate: string | null;
  status: 'assigned' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  notes: string;
  performance: {
    score: number;
    timeTaken?: number;
    attempts?: number;
    feedback?: string;
  } | null;
  progressLogs: Array<{
    date: string;
    status: string;
    notes: string;
    score?: number;
  }>;
  daysSinceAssigned: number;
  daysUntilDue: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChildResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  parentId: string;
  orthophonisteId: string;
  diagnosis: string;
  medicalHistory: string;
  allergies: string[];
  medications: string[];
  therapyGoals: string[];
  therapyFrequency: string;
  therapyDuration: number;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  status: 'active' | 'inactive' | 'discharged';
  notes: string;
  fullName: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}