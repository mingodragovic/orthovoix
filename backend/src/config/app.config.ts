import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  url: process.env.APP_URL || 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://ortho-voix.site',
    'https://www.ortho-voix.site',
    'http://ortho-voix.site',
    'http://www.ortho-voix.site',
  ],
}));