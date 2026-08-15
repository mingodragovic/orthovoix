// src/lib/api/patient-exercises.ts
import { apiClient } from './client';
import type {
  PatientExercise,
  AssignExerciseRequest,
  UpdateStatusRequest,
  UpdateProgressRequest,
  PatientExercisesResponse,
  PatientExerciseResponse,
  PatientProgressResponse,
  PatientExerciseStatus,
} from '@/types/patient-exercise.types';

const PATIENT_EXERCISES_BASE = '/patient-exercises';

// ✅ NEW: Get all assignments (Orthophoniste only)
export async function getAllAssignments(
  page?: number,
  limit?: number,
  status?: PatientExerciseStatus,
  patientId?: string,
  exerciseId?: string
): Promise<PatientExercisesResponse> {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  if (status) params.append('status', status);
  if (patientId) params.append('patientId', patientId);
  if (exerciseId) params.append('exerciseId', exerciseId);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PatientExercisesResponse>(
    `${PATIENT_EXERCISES_BASE}${query}`
  );
  return response.data;
}

// Get all exercises assigned to a patient
export async function getPatientExercises(
  patientId: string,
  status?: PatientExerciseStatus
): Promise<PatientExercisesResponse> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PatientExercisesResponse>(
    `${PATIENT_EXERCISES_BASE}/patient/${patientId}${query}`
  );
  return response.data;
}
// Get patient progress summary
export async function getPatientProgress(patientId: string): Promise<PatientProgressResponse> {
  const response = await apiClient.get<PatientProgressResponse>(
    `${PATIENT_EXERCISES_BASE}/patient/${patientId}/progress`
  );
  return response.data;
}

// Get assignment details by ID
export async function getPatientExerciseById(id: string): Promise<PatientExerciseResponse> {
  const response = await apiClient.get<PatientExerciseResponse>(
    `${PATIENT_EXERCISES_BASE}/${id}`
  );
  return response.data;
}

// Assign an exercise to a patient (Orthophoniste only)
export async function assignExercise(data: AssignExerciseRequest): Promise<PatientExercise> {
  const response = await apiClient.post<PatientExercise>(
    `${PATIENT_EXERCISES_BASE}/assign`,
    data
  );
  return response.data;
}

// Update exercise status
export async function updateExerciseStatus(
  id: string,
  data: UpdateStatusRequest
): Promise<PatientExercise> {
  const response = await apiClient.put<PatientExercise>(
    `${PATIENT_EXERCISES_BASE}/${id}/status`,
    data
  );
  return response.data;
}

// Update exercise progress (performance and logs)
export async function updateExerciseProgress(
  id: string,
  data: UpdateProgressRequest
): Promise<PatientExercise> {
  const response = await apiClient.put<PatientExercise>(
    `${PATIENT_EXERCISES_BASE}/${id}/progress`,
    data
  );
  return response.data;
}