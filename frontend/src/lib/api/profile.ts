// src/lib/api/profile.ts
import { apiClient } from './client';
import type {
  Profile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@/types/profile.types';

const PROFILE_BASE = '/profile';

// Get current user profile
export async function getProfile(): Promise<any> {
  const response = await apiClient.get<any>(`${PROFILE_BASE}`);
  return response.data; // Returns { statusCode, message, data, timestamp, path }
}

// Update profile (JSON)
export async function updateProfile(data: UpdateProfileRequest): Promise<any> {
  const response = await apiClient.put<any>(`${PROFILE_BASE}`, data);
  return response.data; // Returns { statusCode, message, data, timestamp, path }
}

// Upload avatar (multipart/form-data)
export async function uploadAvatar(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.put<any>(`${PROFILE_BASE}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data; // Returns { statusCode, message, data, timestamp, path }
}

// Change password
export async function changePassword(data: ChangePasswordRequest): Promise<any> {
  const response = await apiClient.patch<any>(`${PROFILE_BASE}/password`, data);
  return response.data;
}

// Remove avatar
export async function removeAvatar(): Promise<any> {
  const response = await apiClient.delete<any>(`${PROFILE_BASE}/avatar`);
  return response.data; // Returns { statusCode, message, data, timestamp, path }
}