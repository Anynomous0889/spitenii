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
exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
let RateLimitGuard = class RateLimitGuard {
    constructor(redisService) {
        this.redisService = redisService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip || request.connection?.remoteAddress || request.socket?.remoteAddress || 'unknown';
        const path = request.path;
        let limit = 100;
        let window = 60;
        if (path.includes('/auth/login')) {
            limit = 5;
            window = 900;
        }
        else if (path.includes('/auth/register')) {
            limit = 10;
            window = 3600;
        }
        else if (path.includes('/auth/refresh-token')) {
            limit = 20;
            window = 60;
        }
        const key = `rate_limit:${ip}:${path}`;
        const current = await this.redisService.get(key);
        if (!current) {
            await this.redisService.set(key, '1', window);
            return true;
        }
        const count = parseInt(current, 10);
        if (count >= limit) {
            throw new common_1.HttpException('Too many requests', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        await this.redisService.incr(key);
        return true;
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map