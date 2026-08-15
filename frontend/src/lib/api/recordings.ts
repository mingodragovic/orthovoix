import { PatientRecordingsResponseDto } from "@/types/recording.types";
import { apiClient } from "./client";



const RECORDINGS_BASE = '/recordings';

export async function getAllPatientRecordings(
  page = 1,
  limit = 10
): Promise<PatientRecordingsResponseDto> {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));

  const response = await apiClient.get<PatientRecordingsResponseDto>(
    `${RECORDINGS_BASE}/all?${params.toString()}`
  );
  return response.data;
}