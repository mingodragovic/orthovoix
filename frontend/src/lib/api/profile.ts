// src/lib/api/profile.ts
import { apiClient } from './client';
import type {
  Profile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UploadAvatarResponse,
} from '@/types/profile.types';

const PROFILE_BASE = '/profile';
const STORAGE_BASE = '/storage';

// Get current user profile
export async function getProfile(): Promise<Profile> {
  const response = await apiClient.get<Profile>(`${PROFILE_BASE}`);
  return response.data;
}

// Update profile
export async function updateProfile(data: UpdateProfileRequest): Promise<Profile> {
  const response = await apiClient.put<Profile>(`${PROFILE_BASE}`, data);
  return response.data;
}

// Change password
export async function changePassword(data: ChangePasswordRequest): Promise<any> {
  const response = await apiClient.patch<any>(`${PROFILE_BASE}/password`, data);
  return response.data;
}

// Validate file before upload
export function validateAvatarFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.');
  }
  
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit.');
  }
  
  return true;
}

// Upload avatar - Step 1: Upload file
export async function uploadAvatarFile(file: File, userId: string): Promise<UploadAvatarResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const folder = `avatars/${userId}`;
  const url = `${STORAGE_BASE}/upload?folder=${folder}`;

  const response = await apiClient.post<UploadAvatarResponse>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

// Remove avatar
export async function removeAvatar(): Promise<Profile> {
  const response = await apiClient.delete<Profile>(`${PROFILE_BASE}/avatar`);
  return response.data;
}