// src/modules/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  /**
   * Send OTP for password reset
   */
  async sendPasswordResetOTP(to: string, name: string, otp: string): Promise<void> {
    this.logger.log(`📧 Sending OTP to: ${to}`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset OTP</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 700; color: #4F46E5; }
          .code-box { background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #1F2937; margin: 20px 0; }
          .expiry { color: #6B7280; font-size: 14px; background: #F3F4F6; padding: 12px; border-radius: 6px; text-align: center; }
          .footer { text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐 Orthovoix</div>
          </div>

          <h2>Hello ${name},</h2>

          <p>You requested to reset your password. Use the following OTP code:</p>

          <div class="code-box">
            ${otp}
          </div>

          <div class="expiry">
            ⏰ This OTP will expire in <strong>10 minutes</strong>.
          </div>

          <p>Enter this code in the app to reset your password.</p>

          <p>If you didn't request this, please ignore this email.</p>

          <div class="footer">
            <p>Orthovoix - Speech Therapy Management</p>
            <p>&copy; ${new Date().getFullYear()} Orthovoix. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const result = await this.mailerService.sendMail({
        to,
        subject: '🔐 Your Password Reset OTP - Orthovoix',
        html: htmlContent,
        text: `Hello ${name},\n\nYou requested to reset your password.\n\nYour OTP code is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nOrthovoix - Speech Therapy Management`,
      });

      this.logger.log(`✅ OTP sent successfully to ${to}`);
      this.logger.log(`📨 Message ID: ${result?.messageId || 'N/A'}`);
    } catch (error) {
      const err = error as any;
      this.logger.error(`❌ Failed to send OTP to ${to}:`);
      this.logger.error(`   Error: ${err.message || 'Unknown error'}`);
      this.logger.error(`   Code: ${err.code || 'N/A'}`);
      throw error;
    }
  }

  /**
   * Send password reset email with link
   */
  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('email.frontendUrl') || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    this.logger.log(`📧 Sending password reset email to: ${to}`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 700; color: #4F46E5; }
          .button { display: inline-block; background: #4F46E5; color: white !important; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
          .expiry { color: #6B7280; font-size: 14px; background: #F3F4F6; padding: 12px; border-radius: 6px; }
          .footer { text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐 Orthovoix</div>
          </div>

          <h2>Hello ${name},</h2>

          <p>We received a request to reset your password for your Orthovoix account.</p>

          <p>Click the button below to reset your password:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <div class="expiry">
            ⏰ This link will expire in <strong>1 hour</strong>.
          </div>

          <p>If you didn't request a password reset, you can safely ignore this email.</p>

          <div class="footer">
            <p>Orthovoix - Speech Therapy Management</p>
            <p>&copy; ${new Date().getFullYear()} Orthovoix. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const result = await this.mailerService.sendMail({
        to,
        subject: '🔐 Reset Your Password - Orthovoix',
        html: htmlContent,
        text: `Hello ${name},\n\nWe received a request to reset your password.\n\nClick this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nOrthovoix - Speech Therapy Management`,
      });

      this.logger.log(`✅ Password reset email sent successfully to ${to}`);
      this.logger.log(`📨 Message ID: ${result?.messageId || 'N/A'}`);
    } catch (error) {
      const err = error as any;
      this.logger.error(`❌ Failed to send email to ${to}:`);
      this.logger.error(`   Error: ${err.message || 'Unknown error'}`);
      this.logger.error(`   Code: ${err.code || 'N/A'}`);
      this.logger.error(`   Command: ${err.command || 'N/A'}`);
      throw error;
    }
  }
}