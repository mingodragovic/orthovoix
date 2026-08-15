// src/utils/validators.ts
import { z } from 'zod';

// ============ STATIC SCHEMAS (English) ============
// These are the default schemas with English messages as fallback

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  role: z.literal('parent'),
  childName: z.string()
    .min(2, 'Child name must be at least 2 characters')
    .max(50, 'Child name must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  childId: z.string().optional(),
  avatar: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const verifyOTPSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  otp: z.string()
    .min(1, 'OTP is required')
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
  newPassword: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Token is required'),
  newPassword: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string()
    .min(1, 'Confirm password is required')
    .min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ============ TYPE EXPORTS ============
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type VerifyOTPFormValues = z.infer<typeof verifyOTPSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// ============ TRANSLATION HELPER ============
// Use this function to get translated validation messages

export function getValidationMessage(
  t: (key: string, values?: Record<string, any>) => string,
  key: string,
  fallback: string
): string {
  try {
    const message = t(key, {});
    // If the translation returns the key itself, use fallback
    return message === key ? fallback : message;
  } catch (error) {
    return fallback;
  }
}

// ============ DYNAMIC SCHEMA CREATORS ============
// These functions create schemas with translated messages
// They return the same schema type as the static ones

export function createLoginSchema(
  t: (key: string, values?: Record<string, any>) => string
): typeof loginSchema {
  return z.object({
    email: z.string()
      .min(1, getValidationMessage(t, 'validation.login.email.required', 'Email is required'))
      .email(getValidationMessage(t, 'validation.login.email.invalid', 'Please enter a valid email address')),
    password: z.string()
      .min(1, getValidationMessage(t, 'validation.login.password.required', 'Password is required'))
      .min(6, getValidationMessage(t, 'validation.login.password.minLength', 'Password must be at least 6 characters')),
  });
}

export function createRegisterSchema(
  t: (key: string, values?: Record<string, any>) => string
): typeof registerSchema {
  return z.object({
    name: z.string()
      .min(1, getValidationMessage(t, 'validation.register.name.required', 'Name is required'))
      .min(2, getValidationMessage(t, 'validation.register.name.minLength', 'Name must be at least 2 characters'))
      .max(50, getValidationMessage(t, 'validation.register.name.maxLength', 'Name must be less than 50 characters'))
      .regex(
        /^[a-zA-Z\s'-]+$/, 
        getValidationMessage(t, 'validation.register.name.pattern', 'Name can only contain letters, spaces, hyphens, and apostrophes')
      ),
    email: z.string()
      .min(1, getValidationMessage(t, 'validation.register.email.required', 'Email is required'))
      .email(getValidationMessage(t, 'validation.register.email.invalid', 'Please enter a valid email address')),
    password: z.string()
      .min(1, getValidationMessage(t, 'validation.register.password.required', 'Password is required'))
      .min(6, getValidationMessage(t, 'validation.register.password.minLength', 'Password must be at least 6 characters'))
      .max(100, getValidationMessage(t, 'validation.register.password.maxLength', 'Password must be less than 100 characters'))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        getValidationMessage(t, 'validation.register.password.pattern', 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
      ),
    role: z.literal('parent'),
    childName: z.string()
      .min(2, getValidationMessage(t, 'validation.register.childName.minLength', 'Child name must be at least 2 characters'))
      .max(50, getValidationMessage(t, 'validation.register.childName.maxLength', 'Child name must be less than 50 characters'))
      .optional()
      .or(z.literal('')),
    childId: z.string().optional(),
    avatar: z.string().optional(),
  });
}

export function createForgotPasswordSchema(
  t: (key: string, values?: Record<string, any>) => string
): typeof forgotPasswordSchema {
  return z.object({
    email: z.string()
      .min(1, getValidationMessage(t, 'validation.forgotPassword.email.required', 'Email is required'))
      .email(getValidationMessage(t, 'validation.forgotPassword.email.invalid', 'Please enter a valid email address')),
  });
}

export function createVerifyOTPSchema(
  t: (key: string, values?: Record<string, any>) => string
): typeof verifyOTPSchema {
  return z.object({
    email: z.string()
      .min(1, getValidationMessage(t, 'validation.verifyOTP.email.required', 'Email is required'))
      .email(getValidationMessage(t, 'validation.verifyOTP.email.invalid', 'Please enter a valid email address')),
    otp: z.string()
      .min(1, getValidationMessage(t, 'validation.verifyOTP.otp.required', 'OTP is required'))
      .length(6, getValidationMessage(t, 'validation.verifyOTP.otp.length', 'OTP must be exactly 6 digits'))
      .regex(/^\d+$/, getValidationMessage(t, 'validation.verifyOTP.otp.pattern', 'OTP must contain only numbers')),
    newPassword: z.string()
      .min(1, getValidationMessage(t, 'validation.verifyOTP.newPassword.required', 'Password is required'))
      .min(6, getValidationMessage(t, 'validation.verifyOTP.newPassword.minLength', 'Password must be at least 6 characters'))
      .max(100, getValidationMessage(t, 'validation.verifyOTP.newPassword.maxLength', 'Password must be less than 100 characters'))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        getValidationMessage(t, 'validation.verifyOTP.newPassword.pattern', 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
      ),
  });
}

export function createResetPasswordSchema(
  t: (key: string, values?: Record<string, any>) => string
): typeof resetPasswordSchema {
  return z.object({
    token: z.string()
      .min(1, getValidationMessage(t, 'validation.resetPassword.token.required', 'Token is required')),
    newPassword: z.string()
      .min(1, getValidationMessage(t, 'validation.resetPassword.newPassword.required', 'Password is required'))
      .min(6, getValidationMessage(t, 'validation.resetPassword.newPassword.minLength', 'Password must be at least 6 characters'))
      .max(100, getValidationMessage(t, 'validation.resetPassword.newPassword.maxLength', 'Password must be less than 100 characters'))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        getValidationMessage(t, 'validation.resetPassword.newPassword.pattern', 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
      ),
    confirmPassword: z.string()
      .min(1, getValidationMessage(t, 'validation.resetPassword.confirmPassword.required', 'Confirm password is required'))
      .min(6, getValidationMessage(t, 'validation.resetPassword.confirmPassword.minLength', 'Confirm password must be at least 6 characters')),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: getValidationMessage(t, 'validation.resetPassword.confirmPassword.match', 'Passwords do not match'),
    path: ['confirmPassword'],
  });
}

// ============ HOOK FOR DYNAMIC SCHEMAS ============
// Use this hook in your components to get language-aware schemas

export function useValidationSchemas(
  t: (key: string, values?: Record<string, any>) => string
) {
  return {
    loginSchema: createLoginSchema(t),
    registerSchema: createRegisterSchema(t),
    forgotPasswordSchema: createForgotPasswordSchema(t),
    verifyOTPSchema: createVerifyOTPSchema(t),
    resetPasswordSchema: createResetPasswordSchema(t),
  };
}