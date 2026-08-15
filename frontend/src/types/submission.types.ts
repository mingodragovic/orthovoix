// src/types/submission.types.ts
export type SubmissionStatus = 'pending' | 'reviewed' | 'needs-improvement' | 'approved' | 'rejected';

export interface SubmissionAnswer {
  slideIndex: number;
  recordedAudioKey: string;
  recordedAudioUrl?: string;
  duration: number;
  notes?: string;
}

export interface Submission {
  id: string;
  patientExerciseId: string;
  patientId: string;
  patientName: string;
  exerciseId: string;
  exerciseTitle: string;
  submittedBy: string;
  submitterName: string;
  answers: SubmissionAnswer[];
  metadata: Record<string, any>;
  status: SubmissionStatus;
  notes?: string;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewerName?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionsResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    items: Submission[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SubmissionStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  reviewedSubmissions: number;
  approvedSubmissions: number;
  needsImprovement: number;
  rejectedSubmissions: number;
  completionRate: number;
}

export interface CreateSubmissionRequest {
  patientExerciseId: string;
  answers: SubmissionAnswer[];
  metadata?: Record<string, any>;
  notes?: string;
}

export interface UpdateSubmissionRequest {
  status?: SubmissionStatus;
  notes?: string;
  reviewNotes?: string;
}