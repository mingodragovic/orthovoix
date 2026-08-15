// src/types/profile.types.ts
import { Role } from './api.types';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  // Parent specific
  childName?: string | null;
  childId?: string | null;
  // Orthophoniste specific
  specialization?: string | null;
  licenseNumber?: string | null;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string | null;
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

export interface ProfileResponse {
  statusCode: number;
  message: string;
  data: Profile;
}

export interface PasswordChangeResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}