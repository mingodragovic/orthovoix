// src/types/patient-exercise.types.ts
export type PatientExerciseStatus = 'assigned' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type AssessmentType = 'pronunciation' | 'vocabulary' | 'grammar' | 'comprehension' | 'fluency' | 'articulation' | 'phonology' | 'language' | 'social_communication' | 'overall';
export type GoalStatus = 'not-started' | 'in-progress' | 'achieved' | 'abandoned';

export interface AssessmentScores {
  pronunciationScore?: number;
  vocabularyScore?: number;
  grammarScore?: number;
  comprehensionScore?: number;
  fluencyScore?: number;
  articulationScore?: number;
  phonologyScore?: number;
  languageScore?: number;
  socialCommunicationScore?: number;
  overallScore?: number;
}

export interface Goal {
  description: string;
  status: GoalStatus;
  targetDate?: string;
  achievedDate?: string;
  notes?: string;
}

export interface UpdateProgressRequest {
  performance?: {
    score?: number;
    timeTaken?: number;
    attempts?: number;
    feedback?: string;
  };
  progressLog?: {
    notes: string;
    score?: number;
  };
}

export interface Performance {
  score?: number;
  timeTaken?: number;
  attempts?: number;
  feedback?: string;
  pronunciationScore?: number;
  vocabularyScore?: number;
  grammarScore?: number;
  comprehensionScore?: number;
  fluencyScore?: number;
  articulationScore?: number;
  phonologyScore?: number;
  languageScore?: number;
  socialCommunicationScore?: number;
  overallScore?: number;
  notes?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  nextGoals?: Goal[];
  therapyPlanAdjustments?: string;
  recommendedFrequency?: string;
  therapyDuration?: number;
}

export interface ProgressLog {
  date: string;
  status: string;
  notes: string;
  score?: number;
}

export interface PatientExercise {
  id: string;
  patientId: string;
  patientName: string;
  exerciseId: string;
  exerciseTitle: string;
  exerciseCategory: string;
  assignedBy: string;
  assignerName: string;
  assignedDate: string;
  dueDate?: string;
  completedDate?: string;
  status: PatientExerciseStatus;
  priority: PriorityLevel;
  notes?: string;
  performance?: Performance;
  progressLogs?: ProgressLog[];
  daysSinceAssigned: number;
  daysUntilDue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssignExerciseRequest {
  patientId: string;
  exerciseId: string;
  dueDate?: string;
  priority?: PriorityLevel;
  notes?: string;
}

export interface UpdateStatusRequest {
  status: PatientExerciseStatus;
  notes?: string;
}

export interface PatientProgressSummary {
  patientId: string;
  summary: {
    totalExercises: number;
    completedExercises: number;
    inProgressExercises: number;
    overdueExercises: number;
    completionRate: number;
    averageScore: number;
  };
  categoryBreakdown: Record<string, number>;
  recentLogs: Array<{
    date: string;
    status: string;
    notes: string;
  }>;
}

export interface PatientExercisesResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    items: PatientExercise[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PatientExerciseResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: PatientExercise;
}

export interface PatientProgressResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: PatientProgressSummary;
}