// src/lib/api/auth.ts
import { apiClient } from './client';
import type {
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  UserProfile,
  RefreshTokenRequest,
  RefreshTokenResponseData,
  ForgotPasswordRequest,
  VerifyOTPRequest,
  ResetPasswordRequest,
} from '@/types/auth.types';
import type { ApiResponse } from '@/types/api.types';

const AUTH_BASE = '/auth';

// Login
export async function login(data: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>(
    `${AUTH_BASE}/login`,
    data
  );
  return response.data;
}

// Register
export async function register(data: RegisterRequest): Promise<ApiResponse<{ user: UserProfile }>> {
  const response = await apiClient.post<ApiResponse<{ user: UserProfile }>>(
    `${AUTH_BASE}/register`,
    data
  );
  return response.data;
}

// Logout
export async function logout(): Promise<ApiResponse> {
  const response = await apiClient.post<ApiResponse>(`${AUTH_BASE}/logout`);
  return response.data;
}

// Refresh tokens
export async function refreshTokens(
  data: RefreshTokenRequest
): Promise<ApiResponse<RefreshTokenResponseData>> {
  const response = await apiClient.post<ApiResponse<RefreshTokenResponseData>>(
    `${AUTH_BASE}/refresh`,
    data
  );
  return response.data;
}

// Get current user - properly unwraps the response
export async function getCurrentUser(): Promise<UserProfile> {
  const response = await apiClient.get<ApiResponse<UserProfile>>(`${AUTH_BASE}/me`);
  
  // The API returns: { statusCode, message, data: { user } }
  if (!response.data?.data) {
    throw new Error('Invalid user data response');
  }
  
  return response.data.data;
}

// Forgot password
export async function forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
  const response = await apiClient.post<ApiResponse>(
    `${AUTH_BASE}/forgot-password`,
    data
  );
  return response.data;
}

// Verify OTP
export async function verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse> {
  const response = await apiClient.post<ApiResponse>(
    `${AUTH_BASE}/verify-otp`,
    data
  );
  return response.data;
}

// Reset password
export async function resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
  const response = await apiClient.post<ApiResponse>(
    `${AUTH_BASE}/reset-password`,
    data
  );
  return response.data;
}