// src/types/profile.types.ts
import { Role } from './api.types';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  avatarKey?: string;
  isActive: boolean;
  lastLogin?: string;
  resetPasswordExpires?: string | null;
  childName?: string | null;
  childId?: string | null;
  specialization?: string | null;
  licenseNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
  avatarKey?: string;
  childName?: string | null;
  specialization?: string | null;
  licenseNumber?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UploadAvatarResponse {
  url: string;
  key: string;
  bucket: string;
}