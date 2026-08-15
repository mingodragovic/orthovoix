import * as bcrypt from 'bcrypt';

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
    plainPassword: string,
    hashedPassword: string,
): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
}
/**
 * Generate a random string (for reset tokens, etc.)
 */
export function generateRandomString(length: number = 32): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Minimum 8 characters, at least 1 number, 1 uppercase, 1 lowercase
 */
export function isStrongPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Sanitize user object (remove sensitive fields)
 */
export function sanitizeUser(user: any) {
  const { password, refreshToken, resetPasswordToken, ...sanitized } = user;
  return sanitized;
}

/**
 * Calculate expiration time in milliseconds
 */
export function getExpirationTime(expirationString: string): number {
  const unit = expirationString.slice(-1);
  const value = parseInt(expirationString.slice(0, -1));

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return value * 1000;
  }
}