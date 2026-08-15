// src/types/auth.types.ts
import type { Role } from './api.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  // Parent specific
  childName?: string;
  childId?: string;
  // Orthophoniste specific
  specialization?: string;
  licenseNumber?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'parent';
  avatar?: string;
  childName?: string;
  childId?: string;
  specialization?: string;
  licenseNumber?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}