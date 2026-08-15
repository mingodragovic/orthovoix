// src/lib/api/submissions.ts
import { apiClient } from './client';
import type {
  Submission,
  SubmissionsResponse,
  SubmissionStats,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
  SubmissionStatus,
} from '@/types/submission.types';

const SUBMISSIONS_BASE = '/submissions';

// Get all submissions (Admin only)
export async function getAllSubmissions(
  page = 1,
  limit = 10,
  status?: SubmissionStatus,
  patientId?: string,
  exerciseId?: string
): Promise<SubmissionsResponse['data']> {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (status) params.append('status', status);
  if (patientId) params.append('patientId', patientId);
  if (exerciseId) params.append('exerciseId', exerciseId);

  const response = await apiClient.get<SubmissionsResponse>(
    `${SUBMISSIONS_BASE}?${params.toString()}`
  );
  return response.data.data;
}

// Get my child's submissions (Parent only)
export async function getMySubmissions(
  page = 1,
  limit = 10
): Promise<SubmissionsResponse['data']> {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));

  const response = await apiClient.get<SubmissionsResponse>(
    `${SUBMISSIONS_BASE}/my?${params.toString()}`
  );
  return response.data.data;
}

// Get submissions for a specific patient
export async function getPatientSubmissions(
  patientId: string,
  page = 1,
  limit = 10
): Promise<SubmissionsResponse['data']> {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));

  const response = await apiClient.get<SubmissionsResponse>(
    `${SUBMISSIONS_BASE}/patient/${patientId}?${params.toString()}`
  );
  return response.data.data;
}

// Get submission statistics for a patient
export async function getSubmissionStats(patientId: string): Promise<SubmissionStats> {
  const response = await apiClient.get<{ data: SubmissionStats }>(
    `${SUBMISSIONS_BASE}/patient/${patientId}/stats`
  );
  return response.data.data;
}

// Get submission by ID
export async function getSubmissionById(id: string): Promise<Submission> {
  const response = await apiClient.get<Submission>(`${SUBMISSIONS_BASE}/${id}`);
  return response.data;
}

// Create a new submission
export async function createSubmission(data: CreateSubmissionRequest): Promise<Submission> {
  const response = await apiClient.post<Submission>(SUBMISSIONS_BASE, data);
  return response.data;
}

// Update submission (Admin only)
export async function updateSubmission(
  id: string,
  data: UpdateSubmissionRequest
): Promise<Submission> {
  const response = await apiClient.put<Submission>(`${SUBMISSIONS_BASE}/${id}`, data);
  return response.data;
}

// Update submission status (Admin only)
export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  reviewNotes?: string
): Promise<Submission> {
  const response = await apiClient.put<Submission>(
    `${SUBMISSIONS_BASE}/${id}/status`,
    { status, reviewNotes }
  );
  return response.data;
}

// Delete submission (Admin only)
export async function deleteSubmission(id: string): Promise<void> {
  await apiClient.delete(`${SUBMISSIONS_BASE}/${id}`);
}