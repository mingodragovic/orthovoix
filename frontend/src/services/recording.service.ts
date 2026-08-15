// src/services/recording.service.ts
import { apiClient } from '@/lib/api/client';
import type {
  RecordingResponseDto,
  CreateRecordingDto,
  UpdateRecordingReviewDto,
  UploadRecordingResponseDto,
  PatientRecordingsResponseDto,
  RecordingStatus,
} from '@/types/recording.types';

const RECORDINGS_BASE = '/recordings';
const STORAGE_BASE = '/storage';

// ============ Upload ============

export async function uploadRecordingFile(
  file: Blob,
  patientId: string,
  exerciseId: string,
  assignmentId: string
): Promise<UploadRecordingResponseDto> {
  console.log('📤 [uploadRecordingFile] Starting upload:', {
    patientId,
    exerciseId,
    assignmentId,
    fileSize: file.size,
    fileType: file.type,
  });

  const formData = new FormData();
  formData.append('file', file, 'recording.webm');
  formData.append('patientId', patientId);
  formData.append('exerciseId', exerciseId);
  formData.append('assignmentId', assignmentId);

  const response = await apiClient.post<{ data: UploadRecordingResponseDto }>(
    `${STORAGE_BASE}/upload/recording`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  console.log('✅ [uploadRecordingFile] Upload complete:', response.data.data);
  return response.data.data;
}

// ============ Metadata ============

export async function createRecording(
  assignmentId: string,
  data: CreateRecordingDto
): Promise<RecordingResponseDto> {
  console.log('📝 [createRecording] Creating recording metadata:', {
    assignmentId,
    data,
  });

  const response = await apiClient.post<{ data: RecordingResponseDto }>(
    `${RECORDINGS_BASE}/patient-exercises/${assignmentId}`,
    data
  );
  console.log('✅ [createRecording] Metadata created:', response.data.data);
  return response.data.data;
}

export async function getRecordingsByAssignment(
  assignmentId: string
): Promise<RecordingResponseDto[]> {
  console.log('📋 [getRecordingsByAssignment] Fetching recordings for assignment:', assignmentId);

  const response = await apiClient.get<{ data: RecordingResponseDto[] }>(
    `${RECORDINGS_BASE}/patient-exercises/${assignmentId}`
  );
  console.log('✅ [getRecordingsByAssignment] Retrieved:', response.data.data.length, 'recordings');
  return response.data.data;
}

export async function getRecordingById(
  recordingId: string
): Promise<RecordingResponseDto> {
  console.log('🔍 [getRecordingById] Fetching recording:', recordingId);

  const response = await apiClient.get<{ data: RecordingResponseDto }>(
    `${RECORDINGS_BASE}/${recordingId}`
  );
  console.log('✅ [getRecordingById] Retrieved:', response.data.data);
  return response.data.data;
}

export async function getFreshRecordingUrl(
  recordingId: string
): Promise<{ url: string; expiresIn: number }> {
  console.log('🔄 [getFreshRecordingUrl] Getting fresh URL for:', recordingId);

  const response = await apiClient.get<{ data: { url: string; expiresIn: number } }>(
    `${RECORDINGS_BASE}/${recordingId}/url`
  );
  console.log('✅ [getFreshRecordingUrl] Fresh URL generated');
  return response.data.data;
}

// ============ Review (Orthophoniste Only) ============

export async function reviewRecording(
  recordingId: string,
  data: UpdateRecordingReviewDto
): Promise<RecordingResponseDto> {
  console.log('📝 [reviewRecording] Reviewing recording:', {
    recordingId,
    data,
  });

  const response = await apiClient.patch<{ data: RecordingResponseDto }>(
    `${RECORDINGS_BASE}/${recordingId}/review`,
    data
  );
  console.log('✅ [reviewRecording] Review complete:', response.data.data);
  return response.data.data;
}

export async function getPatientRecordings(
  patientId: string,
  page = 1,
  limit = 10
): Promise<PatientRecordingsResponseDto> {
  console.log('📋 [getPatientRecordings] Fetching recordings for patient:', {
    patientId,
    page,
    limit,
  });

  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));

  const response = await apiClient.get<PatientRecordingsResponseDto>(
    `${RECORDINGS_BASE}/patient/${patientId}?${params.toString()}`
  );
  console.log('✅ [getPatientRecordings] Retrieved:', response.data.items.length, 'recordings');
  return response.data;
}

// Get all recordings across all patients (Orthophoniste only)
export async function getAllPatientRecordings(
  page = 1,
  limit = 10,
  status?: RecordingStatus,
  patientId?: string,
  exerciseId?: string
): Promise<PatientRecordingsResponseDto> {
  console.log('📋 [getAllPatientRecordings] Fetching ALL recordings:', {
    page,
    limit,
    status,
    patientId,
    exerciseId,
  });

  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (status) params.append('status', status);
  if (patientId) params.append('patientId', patientId);
  if (exerciseId) params.append('exerciseId', exerciseId);

  const response = await apiClient.get<PatientRecordingsResponseDto>(
    `${RECORDINGS_BASE}/all?${params.toString()}`
  );
  
  console.log('✅ [getAllPatientRecordings] Retrieved:', response.data.data.items.length, 'recordings');
  console.log('📊 [getAllPatientRecordings] Full response:', response.data);
  
  // ✅ FIX: Return response.data.data (the actual data object), NOT response.data
  return response.data.data;
}

// ============ Delete ============

export async function deleteRecording(recordingId: string): Promise<void> {
  console.log('🗑️ [deleteRecording] Deleting recording:', recordingId);
  await apiClient.delete(`${RECORDINGS_BASE}/${recordingId}`);
  console.log('✅ [deleteRecording] Deleted');
}