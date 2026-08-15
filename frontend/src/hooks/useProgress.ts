// src/hooks/useProgress.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  ProgressSummaryResponse,
  ProgressChartResponse,
  ProgressRecordsResponse,
} from '@/types/progress.types';

const PROGRESS_BASE = '/progress';

export const progressKeys = {
  all: ['progress'] as const,
  summary: (patientId: string) => [...progressKeys.all, 'summary', patientId] as const,
  chart: (patientId: string, type?: string) =>
    [...progressKeys.all, 'chart', patientId, type] as const,
  records: (patientId: string, type?: string, limit?: number) =>
    [...progressKeys.all, 'records', patientId, type, limit] as const,
  detail: (id: string) => [...progressKeys.all, 'detail', id] as const,
};

// Get progress summary
export async function getProgressSummary(
  patientId: string
): Promise<ProgressSummaryResponse['data']> {
  const response = await apiClient.get<ProgressSummaryResponse>(
    `${PROGRESS_BASE}/patient/${patientId}/summary`
  );
  return response.data.data;
}

// Get progress chart data
export async function getProgressChart(
  patientId: string,
  type?: string
): Promise<ProgressChartResponse['data']> {
  const params = new URLSearchParams();
  if (type) params.append('type', type);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<ProgressChartResponse>(
    `${PROGRESS_BASE}/patient/${patientId}/chart${query}`
  );
  return response.data.data;
}

// Get progress records
export async function getProgressRecords(
  patientId: string,
  type?: string,
  limit = 10
): Promise<ProgressRecordsResponse['data']> {
  const params = new URLSearchParams();
  params.append('limit', String(limit));
  if (type) params.append('type', type);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<ProgressRecordsResponse>(
    `${PROGRESS_BASE}/patient/${patientId}${query}`
  );
  return response.data.data;
}

export function useProgressSummary(patientId: string) {
  return useQuery({
    queryKey: progressKeys.summary(patientId),
    queryFn: () => getProgressSummary(patientId),
    enabled: !!patientId,
  });
}

export function useProgressChart(patientId: string, type?: string) {
  return useQuery({
    queryKey: progressKeys.chart(patientId, type),
    queryFn: () => getProgressChart(patientId, type),
    enabled: !!patientId,
  });
}

export function useProgressRecords(patientId: string, type?: string, limit = 10) {
  return useQuery({
    queryKey: progressKeys.records(patientId, type, limit),
    queryFn: () => getProgressRecords(patientId, type, limit),
    enabled: !!patientId,
  });
}