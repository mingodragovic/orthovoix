// src/lib/api/patients.ts
import { apiClient } from './client';
import type {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientFilters,
  PatientsResponse,
  PatientResponse,
  PatientExercisesResponse,
  PatientProgressResponse,
} from '@/types/patient.types';
import type { ApiResponse } from '@/types/api.types';

const PATIENTS_BASE = '/patients';

// Get all patients (Orthophoniste only)
export async function getPatients(filters?: PatientFilters): Promise<PatientsResponse> {
  const params = new URLSearchParams();
  
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.search) params.append('search', filters.search);
  if (filters?.status) params.append('status', filters.status);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PatientsResponse>(`${PATIENTS_BASE}${query}`);
  return response.data;
}

// Get my patients (Orthophoniste only)
export async function getMyPatients(filters?: PatientFilters): Promise<PatientsResponse> {
  const params = new URLSearchParams();
  
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.status) params.append('status', filters.status);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<PatientsResponse>(`${PATIENTS_BASE}/my-patients${query}`);
  return response.data;
}

// Get my child (Parent only)
export async function getMyChild(): Promise<Patient> {
  const response = await apiClient.get<Patient>(`${PATIENTS_BASE}/my-child`);
  return response.data;
}

// Get patient by ID
export async function getPatientById(id: string): Promise<PatientResponse> {
  const response = await apiClient.get<PatientResponse>(`${PATIENTS_BASE}/${id}`);
  return response.data;
}

// Create a new patient (Orthophoniste only)
export async function createPatient(data: CreatePatientRequest): Promise<Patient> {
  const response = await apiClient.post<Patient>(PATIENTS_BASE, data);
  return response.data;
}

// Update a patient (Orthophoniste only)
export async function updatePatient(id: string, data: UpdatePatientRequest): Promise<Patient> {
  const response = await apiClient.put<Patient>(`${PATIENTS_BASE}/${id}`, data);
  return response.data;
}

// Delete a patient (soft delete - Orthophoniste only)
export async function deletePatient(id: string): Promise<ApiResponse> {
  const response = await apiClient.delete<ApiResponse>(`${PATIENTS_BASE}/${id}`);
  return response.data;
}

// Get patient exercises (Placeholder)
export async function getPatientExercises(id: string): Promise<PatientExercisesResponse> {
  const response = await apiClient.get<PatientExercisesResponse>(`${PATIENTS_BASE}/${id}/exercises`);
  return response.data;
}

// Get patient progress (Placeholder)
export async function getPatientProgress(id: string): Promise<PatientProgressResponse> {
  const response = await apiClient.get<PatientProgressResponse>(`${PATIENTS_BASE}/${id}/progress`);
  return response.data;
}