import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../security/encryption.service';
import { AuditService } from '../security/audit.service';
import { EmailService } from './email.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly encryptionService;
    private readonly auditService;
    private readonly emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, encryptionService: EncryptionService, auditService: AuditService, emailService: EmailService);
    register(data: {
        email: string;
        password: string;
        businessName: string;
        role?: string;
    }): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    login(email: string, password: string, twoFactorCode?: string, ip?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            businessId: string;
        };
    }>;
    handleFailedLogin(userId: string): Promise<void>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    enable2FA(userId: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    verify2FA(userId: string, code: string): Promise<{
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    private generateToken;
}
