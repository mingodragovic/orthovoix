// src/config/email.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  smtpHost: process.env.MAILGUN_SMTP_HOST || 'smtp.mailgun.org',
  smtpPort: parseInt(process.env.MAILGUN_SMTP_PORT || '587', 10),
  smtpUser: process.env.MAILGUN_SMTP_USER || '',
  smtpPass: process.env.MAILGUN_SMTP_PASS || '',
  from: process.env.MAILGUN_FROM || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
}));