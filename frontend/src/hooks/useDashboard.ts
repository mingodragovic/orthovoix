// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { AdminDashboardResponse } from '@/types/dashboard.types';

const DASHBOARD_BASE = '/dashboard';

export const dashboardKeys = {
  admin: ['dashboard', 'admin'] as const,
  parent: ['dashboard', 'parent'] as const,
};

export async function getAdminDashboard(): Promise<AdminDashboardResponse['data']> {
  const response = await apiClient.get<AdminDashboardResponse>(
    `${DASHBOARD_BASE}/admin`
  );
  return response.data.data;
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: dashboardKeys.admin,
    queryFn: getAdminDashboard,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}