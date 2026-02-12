import { AuthService } from './auth.service';
import { IpBanGuard } from '../security/ip-ban.guard';
import { Request } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
export declare class AuthController {
    private readonly authService;
    private readonly ipBanGuard;
    constructor(authService: AuthService, ipBanGuard: IpBanGuard);
    register(body: RegisterDto, req: Request): Promise<void>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    login(body: LoginDto, req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            businessId: string;
        };
    }>;
    forgotPassword(body: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(body: ResetPasswordDto): Promise<{
        message: string;
    }>;
    refreshToken(body: {
        refreshToken: string;
    }): Promise<{
        accessToken: string;
    }>;
    enable2FA(req: any): Promise<{
        secret: string;
        qrCode: string;
    }>;
    verify2FA(req: any, body: Verify2FADto): Promise<{
        message: string;
    }>;
}
