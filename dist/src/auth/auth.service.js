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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const encryption_service_1 = require("../security/encryption.service");
const audit_service_1 = require("../security/audit.service");
const email_service_1 = require("./email.service");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
let AuthService = class AuthService {
    constructor(prisma, jwtService, encryptionService, auditService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.encryptionService = encryptionService;
        this.auditService = auditService;
        this.emailService = emailService;
    }
    async register(data) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw new common_1.BadRequestException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(data.password, 12);
        const verifyToken = this.generateToken();
        const business = await this.prisma.business.create({
            data: { name: data.businessName, email: data.email },
        });
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: data.role || 'OWNER',
                businessId: business.id,
                emailVerifyToken: verifyToken,
            },
        });
        await this.emailService.sendVerificationEmail(data.email, verifyToken);
        await this.auditService.log({
            userId: user.id,
            action: 'USER_REGISTERED',
            entity: 'User',
            entityId: user.id,
        });
        return { message: 'Registration successful. Please check your email to verify.' };
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({ where: { emailVerifyToken: token } });
        if (!user) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true, emailVerifyToken: null },
        });
        return { message: 'Email verified successfully' };
    }
    async login(email, password, twoFactorCode, ip) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
            throw new common_1.UnauthorizedException(`Account locked. Try again in ${minutesLeft} minutes.`);
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Password not set. Please contact administrator.');
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            await this.handleFailedLogin(user.id);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isEmailVerified && user.role !== 'CUSTOMER' && user.role !== 'OWNER') {
            throw new common_1.UnauthorizedException('Please verify your email first');
        }
        if (user.twoFactorEnabled) {
            if (!twoFactorCode) {
                throw new common_1.UnauthorizedException('2FA code required');
            }
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: twoFactorCode,
            });
            if (!verified) {
                throw new common_1.UnauthorizedException('Invalid 2FA code');
            }
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                failedAttempts: 0,
                isLocked: false,
                lockedUntil: null,
                lastLoginAt: new Date(),
                lastLoginIp: ip,
            },
        });
        await this.auditService.log({
            userId: user.id,
            action: 'USER_LOGIN',
            entity: 'User',
            entityId: user.id,
            ipAddress: ip,
        });
        const accessToken = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign({ sub: user.id, type: 'refresh' }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                businessId: user.businessId,
            },
        };
    }
    async handleFailedLogin(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return;
        const failedAttempts = user.failedAttempts + 1;
        const updateData = { failedAttempts };
        if (failedAttempts >= 5) {
            updateData.isLocked = true;
            updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        await this.prisma.user.update({ where: { id: userId }, data: updateData });
    }
    async requestPasswordReset(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { message: 'If email exists, reset link has been sent' };
        }
        const resetToken = this.generateToken();
        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetPasswordToken: resetToken },
        });
        await this.emailService.sendPasswordResetEmail(email, resetToken);
        return { message: 'If email exists, reset link has been sent' };
    }
    async resetPassword(token, newPassword) {
        const user = await this.prisma.user.findFirst({ where: { resetPasswordToken: token } });
        if (!user) {
            throw new common_1.BadRequestException('Invalid reset token');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, resetPasswordToken: null },
        });
        return { message: 'Password reset successful' };
    }
    async enable2FA(userId) {
        const secret = speakeasy.generateSecret({ length: 32 });
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret.base32 },
        });
        return {
            secret: secret.base32,
            qrCode: secret.otpauth_url,
        };
    }
    async verify2FA(userId, code) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.twoFactorSecret) {
            throw new common_1.BadRequestException('2FA not set up');
        }
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
        });
        if (!verified) {
            throw new common_1.BadRequestException('Invalid code');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true },
        });
        return { message: '2FA enabled successfully' };
    }
    async refreshToken(refreshToken) {
        if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.length > 500) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        try {
            const refreshSecret = process.env.JWT_REFRESH_SECRET;
            if (!refreshSecret) {
                throw new Error('JWT_REFRESH_SECRET not configured');
            }
            const payload = this.jwtService.verify(refreshToken, {
                secret: refreshSecret,
            });
            if (payload.type !== 'refresh') {
                throw new common_1.UnauthorizedException('Invalid token type');
            }
            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user || user.isLocked) {
                throw new common_1.UnauthorizedException();
            }
            const accessToken = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '15m' });
            return { accessToken };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    generateToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        encryption_service_1.EncryptionService,
        audit_service_1.AuditService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map