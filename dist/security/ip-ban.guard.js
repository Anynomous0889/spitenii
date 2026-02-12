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
exports.IpBanGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("./redis.service");
let IpBanGuard = class IpBanGuard {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip || request.connection?.remoteAddress || request.socket?.remoteAddress || 'unknown';
        const cacheKey = `ip_ban:${ip}`;
        const cached = await this.redis.get(cacheKey);
        if (cached === 'banned') {
            throw new common_1.HttpException('IP address is banned', common_1.HttpStatus.FORBIDDEN);
        }
        const bannedIp = await this.prisma.bannedIP.findUnique({
            where: { ipAddress: ip },
        });
        if (bannedIp && bannedIp.expiresAt > new Date()) {
            await this.redis.set(cacheKey, 'banned', 3600);
            throw new common_1.HttpException('IP address is banned', common_1.HttpStatus.FORBIDDEN);
        }
        if (bannedIp && bannedIp.expiresAt <= new Date()) {
            await this.prisma.bannedIP.delete({ where: { id: bannedIp.id } });
        }
        return true;
    }
    async trackFailedAttempt(ip, type) {
        const key = `failed_${type}:${ip}`;
        const count = await this.redis.incr(key);
        if (count === 1) {
            await this.redis.expire(key, 3600);
        }
        if (type === 'login' && count >= 20) {
            await this.banIp(ip, 'Too many failed login attempts', 24 * 3600);
        }
        else if (type === 'signup' && count >= 10) {
            await this.banIp(ip, 'Too many signup attempts', 3600);
        }
    }
    async banIp(ip, reason, durationSeconds) {
        const expiresAt = new Date(Date.now() + durationSeconds * 1000);
        await this.prisma.bannedIP.upsert({
            where: { ipAddress: ip },
            create: { ipAddress: ip, reason, expiresAt },
            update: { reason, expiresAt },
        });
        await this.redis.set(`ip_ban:${ip}`, 'banned', durationSeconds);
    }
};
exports.IpBanGuard = IpBanGuard;
exports.IpBanGuard = IpBanGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], IpBanGuard);
//# sourceMappingURL=ip-ban.guard.js.map