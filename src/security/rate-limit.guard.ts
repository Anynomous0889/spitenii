import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection?.remoteAddress || request.socket?.remoteAddress || 'unknown';
    const path = request.path;
    
    let limit = 100;
    let window = 60;
    
    if (path.includes('/auth/login')) {
      limit = 5;
      window = 900;
    } else if (path.includes('/auth/register')) {
      limit = 10;
      window = 3600;
    } else if (path.includes('/auth/refresh-token')) {
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
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    
    await this.redisService.incr(key);
    return true;
  }
}
