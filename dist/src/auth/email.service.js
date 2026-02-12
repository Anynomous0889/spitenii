"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.transporter = null;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.isConfigured = false;
        const smtpHost = this.configService.get('SMTP_HOST');
        const smtpUser = this.configService.get('SMTP_USER');
        const smtpPassword = this.configService.get('SMTP_PASSWORD');
        if (smtpHost && smtpUser && smtpPassword) {
            try {
                this.transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: this.configService.get('SMTP_PORT') || 587,
                    secure: false,
                    auth: {
                        user: smtpUser,
                        pass: smtpPassword,
                    },
                });
                this.isConfigured = true;
                this.logger.log('Email service configured');
            }
            catch (error) {
                this.logger.error(`Failed to configure email service: ${error.message}`);
            }
        }
        else {
            this.logger.warn('SMTP not configured, email features will be disabled');
        }
    }
    async sendVerificationEmail(email, token) {
        if (!this.isConfigured || !this.transporter) {
            this.logger.warn(`Email verification skipped (SMTP not configured). Token: ${token}`);
            return;
        }
        const sanitizedEmail = email.replace(/[<>\"']/g, '');
        const sanitizedToken = token.replace(/[<>\"']/g, '');
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
        const url = `${frontendUrl}/verify-email?token=${encodeURIComponent(sanitizedToken)}`;
        try {
            await this.transporter.sendMail({
                from: this.configService.get('SMTP_FROM') || 'noreply@yourbusiness.com',
                to: sanitizedEmail,
                subject: 'Verify Your Email',
                html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
            });
        }
        catch (error) {
            this.logger.error(`Failed to send verification email: ${error.message}`);
            throw error;
        }
    }
    async sendPasswordResetEmail(email, token) {
        if (!this.isConfigured || !this.transporter) {
            this.logger.warn(`Password reset email skipped (SMTP not configured). Token: ${token}`);
            return;
        }
        const sanitizedEmail = email.replace(/[<>\"']/g, '');
        const sanitizedToken = token.replace(/[<>\"']/g, '');
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
        const url = `${frontendUrl}/reset-password?token=${encodeURIComponent(sanitizedToken)}`;
        try {
            await this.transporter.sendMail({
                from: this.configService.get('SMTP_FROM') || 'noreply@yourbusiness.com',
                to: sanitizedEmail,
                subject: 'Reset Your Password',
                html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
            });
        }
        catch (error) {
            this.logger.error(`Failed to send password reset email: ${error.message}`);
            throw error;
        }
    }
    async sendInvoiceEmail(email, pdfBuffer, invoiceNumber) {
        if (!this.isConfigured || !this.transporter) {
            this.logger.warn(`Invoice email skipped (SMTP not configured) for invoice ${invoiceNumber}`);
            return;
        }
        const sanitizedEmail = email.replace(/[<>\"']/g, '');
        const sanitizedInvoiceNumber = invoiceNumber.replace(/[<>\"'\/\\]/g, '');
        try {
            await this.transporter.sendMail({
                from: this.configService.get('SMTP_FROM') || 'noreply@yourbusiness.com',
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
        }
        catch (error) {
            this.logger.error(`Failed to send invoice email: ${error.message}`);
            throw error;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map