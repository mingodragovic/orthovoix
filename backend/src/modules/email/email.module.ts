// src/modules/email/email.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const smtpHost = configService.get<string>('MAILGUN_SMTP_HOST', 'smtp.mailgun.org');
        const smtpPort = configService.get<number>('MAILGUN_SMTP_PORT', 587);
        const smtpUser = configService.get<string>('MAILGUN_SMTP_USER');
        const smtpPass = configService.get<string>('MAILGUN_SMTP_PASS');
        const from = configService.get<string>('MAILGUN_FROM');

        // Log configuration status (without exposing the password)
        console.log('📧 Mailgun SMTP Config:');
        console.log(`   Host: ${smtpHost}`);
        console.log(`   Port: ${smtpPort}`);
        console.log(`   User: ${smtpUser ? '✅ Set' : '❌ Missing'}`);
        console.log(`   Pass: ${smtpPass ? '✅ Set' : '❌ Missing'}`);
        console.log(`   From: ${from || '❌ Missing'}`);

        if (!smtpUser || !smtpPass || !from) {
          console.warn('⚠️  Mailgun credentials missing! Check your .env file.');
        }

        return {
          transport: {
            host: smtpHost,
            port: smtpPort,
            secure: false,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
            family: 4,
            connectionTimeout: 10000,
          },
          defaults: {
            from: `"Orthovoix" <${from}>`,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}