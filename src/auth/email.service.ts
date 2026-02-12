import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(EmailService.name);
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');

    if (smtpHost && smtpUser && smtpPassword) {
      try {
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: this.configService.get<number>('SMTP_PORT') || 587,
          secure: false,
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
        });
        this.isConfigured = true;
        this.logger.log('Email service configured');
      } catch (error) {
        this.logger.error(`Failed to configure email service: ${error.message}`);
      }
    } else {
      this.logger.warn('SMTP not configured, email features will be disabled');
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    if (!this.isConfigured || !this.transporter) {
      this.logger.warn(`Email verification skipped (SMTP not configured). Token: ${token}`);
      return;
    }

    // Sanitize email and token to prevent injection
    const sanitizedEmail = email.replace(/[<>\"']/g, '');
    const sanitizedToken = token.replace(/[<>\"']/g, '');

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const url = `${frontendUrl}/verify-email?token=${encodeURIComponent(sanitizedToken)}`;
    
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM') || 'noreply@yourbusiness.com',
        to: sanitizedEmail,
        subject: 'Verify Your Email',
        html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
      });
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    if (!this.isConfigured || !this.transporter) {
      this.logger.warn(`Password reset email skipped (SMTP not configured). Token: ${token}`);
      return;
    }

    // Sanitize email and token
    const sanitizedEmail = email.replace(/[<>\"']/g, '');
    const sanitizedToken = token.replace(/[<>\"']/g, '');

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const url = `${frontendUrl}/reset-password?token=${encodeURIComponent(sanitizedToken)}`;
    
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM') || 'noreply@yourbusiness.com',
        to: sanitizedEmail,
        subject: 'Reset Your Password',
        html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
      });
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`);
      throw error;
    }
  }

  async sendInvoiceEmail(email: string, pdfBuffer: Buffer, invoiceNumber: string) {
    if (!this.isConfigured || !this.transporter) {
      this.logger.warn(`Invoice email skipped (SMTP not configured) for invoice ${invoiceNumber}`);
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = email.replace(/[<>\"']/g, '');
    const sanitizedInvoiceNumber = invoiceNumber.replace(/[<>\"'\/\\]/g, '');

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM') || 'noreply@yourbusiness.com',
        to: sanitizedEmail,
        subject: `Invoice ${sanitizedInvoiceNumber}`,
        html: `<p>Please find your invoice attached.</p>`,
        attachments: [
          {
            filename: `invoice-${sanitizedInvoiceNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
    } catch (error) {
      this.logger.error(`Failed to send invoice email: ${error.message}`);
      throw error;
    }
  }
}
