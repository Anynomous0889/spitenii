import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from './redis.service';

@Injectable()
export class IpBanGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection?.remoteAddress || request.socket?.remoteAddress || 'unknown';
    
    const cacheKey = `ip_ban:${ip}`;
    const cached = await this.redis.get(cacheKey);
    if (cached === 'banned') {
      throw new HttpException('IP address is banned', HttpStatus.FORBIDDEN);
    }
    
    const bannedIp = await this.prisma.bannedIP.findUnique({
      where: { ipAddress: ip },
    });
    
    if (bannedIp && bannedIp.expiresAt > new Date()) {
      await this.redis.set(cacheKey, 'banned', 3600);
      throw new HttpException('IP address is banned', HttpStatus.FORBIDDEN);
    }
    
    if (bannedIp && bannedIp.expiresAt <= new Date()) {
      await this.prisma.bannedIP.delete({ where: { id: bannedIp.id } });
    }
    
    return true;
  }

  async trackFailedAttempt(ip: string, type: 'login' | 'signup'): Promise<void> {
    const key = `failed_${type}:${ip}`;
    const count = await this.redis.incr(key);
    
    if (count === 1) {
      await this.redis.expire(key, 3600);
    }
    
    if (type === 'login' && count >= 20) {
      await this.banIp(ip, 'Too many failed login attempts', 24 * 3600);
    } else if (type === 'signup' && count >= 10) {
      await this.banIp(ip, 'Too many signup attempts', 3600);
    }
  }

  async banIp(ip: string, reason: string, durationSeconds: number): Promise<void> {
    const expiresAt = new Date(Date.now() + durationSeconds * 1000);
    await this.prisma.bannedIP.upsert({
      where: { ipAddress: ip },
      create: { ipAddress: ip, reason, expiresAt },
      update: { reason, expiresAt },
    });
    await this.redis.set(`ip_ban:${ip}`, 'banned', durationSeconds);
  }
}
