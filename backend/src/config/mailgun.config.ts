// src/config/mailgun.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('mailgun', () => ({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
  region: process.env.MAILGUN_REGION || 'us',
  from: process.env.MAILGUN_FROM || `noreply@${process.env.MAILGUN_DOMAIN}`,
}));