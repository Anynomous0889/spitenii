import { Controller, Post, Body, UseGuards, Get, Query, Req, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RateLimitGuard } from '../security/rate-limit.guard';
import { IpBanGuard } from '../security/ip-ban.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';

@Controller('auth')
@UseGuards(IpBanGuard, RateLimitGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly ipBanGuard: IpBanGuard,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterDto, @Req() req: Request) {
    throw new BadRequestException('Registration is disabled. Please contact administrator.');
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token || typeof token !== 'string' || token.length > 200) {
      throw new BadRequestException('Invalid verification token');
    }
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '';
    try {
      return await this.authService.login(body.email, body.password, body.twoFactorCode, ip);
    } catch (error) {
      await this.ipBanGuard.trackFailedAttempt(ip, 'login');
      throw error;
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    if (!body.token || typeof body.token !== 'string' || body.token.length > 200) {
      throw new BadRequestException('Invalid reset token');
    }
    return this.authService.resetPassword(body.token, body.password);
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken || typeof body.refreshToken !== 'string') {
      throw new BadRequestException('Refresh token is required');
    }
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  async enable2FA(@Req() req: any) {
    return this.authService.enable2FA(req.user.userId);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  async verify2FA(@Req() req: any, @Body() body: Verify2FADto) {
    return this.authService.verify2FA(req.user.userId, body.code);
  }
}
