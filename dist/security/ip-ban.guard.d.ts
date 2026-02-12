import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from './redis.service';
export declare class IpBanGuard implements CanActivate {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    trackFailedAttempt(ip: string, type: 'login' | 'signup'): Promise<void>;
    banIp(ip: string, reason: string, durationSeconds: number): Promise<void>;
}
