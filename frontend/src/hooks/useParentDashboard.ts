// src/hooks/useParentDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ParentDashboardResponse } from '@/types/dashboard.types';
import { useAuth } from '@/providers/AuthProvider';

const DASHBOARD_BASE = '/dashboard';

export const dashboardKeys = {
  parent: ['dashboard', 'parent'] as const,
};

export async function getParentDashboard(): Promise<ParentDashboardResponse['data']> {
  const response = await apiClient.get<ParentDashboardResponse>(
    `${DASHBOARD_BASE}/parent`
  );
  return response.data.data;
}

// ✅ Updated to accept a boolean parameter
export function useParentDashboard(enabled: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.parent,
    queryFn: getParentDashboard,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled, // ✅ Use the passed parameter
  });
}