import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { EncryptionService } from './encryption.service';
import { RateLimitGuard } from './rate-limit.guard';
import { IpBanGuard } from './ip-ban.guard';
import { AuditService } from './audit.service';

@Module({
  providers: [RedisService, EncryptionService, RateLimitGuard, IpBanGuard, AuditService],
  exports: [RedisService, EncryptionService, RateLimitGuard, IpBanGuard, AuditService],
})
export class SecurityModule {}
