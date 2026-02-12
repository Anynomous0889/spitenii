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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const rate_limit_guard_1 = require("../security/rate-limit.guard");
const ip_ban_guard_1 = require("../security/ip-ban.guard");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const verify_2fa_dto_1 = require("./dto/verify-2fa.dto");
let AuthController = class AuthController {
    constructor(authService, ipBanGuard) {
        this.authService = authService;
        this.ipBanGuard = ipBanGuard;
    }
    async register(body, req) {
        throw new common_1.BadRequestException('Registration is disabled. Please contact administrator.');
    }
    async verifyEmail(token) {
        if (!token || typeof token !== 'string' || token.length > 200) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        return this.authService.verifyEmail(token);
    }
    async login(body, req) {
        const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '';
        try {
            return await this.authService.login(body.email, body.password, body.twoFactorCode, ip);
        }
        catch (error) {
            await this.ipBanGuard.trackFailedAttempt(ip, 'login');
            throw error;
        }
    }
    async forgotPassword(body) {
        return this.authService.requestPasswordReset(body.email);
    }
    async resetPassword(body) {
        if (!body.token || typeof body.token !== 'string' || body.token.length > 200) {
            throw new common_1.BadRequestException('Invalid reset token');
        }
        return this.authService.resetPassword(body.token, body.password);
    }
    async refreshToken(body) {
        if (!body.refreshToken || typeof body.refreshToken !== 'string') {
            throw new common_1.BadRequestException('Refresh token is required');
        }
        return this.authService.refreshToken(body.refreshToken);
    }
    async enable2FA(req) {
        return this.authService.enable2FA(req.user.userId);
    }
    async verify2FA(req, body) {
        return this.authService.verify2FA(req.user.userId, body.code);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('verify-email'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('2fa/enable'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enable2FA", null);
__decorate([
    (0, common_1.Post)('2fa/verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, verify_2fa_dto_1.Verify2FADto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2FA", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    (0, common_1.UseGuards)(ip_ban_guard_1.IpBanGuard, rate_limit_guard_1.RateLimitGuard),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        ip_ban_guard_1.IpBanGuard])
], AuthController);
//# sourceMappingURL=auth.controller.js.map