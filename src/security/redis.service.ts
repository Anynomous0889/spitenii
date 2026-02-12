import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: RedisClientType;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not set, Redis features will be disabled');
      return;
    }

    try {
      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              this.logger.error('Redis reconnection failed after 10 attempts');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        this.logger.error(`Redis error: ${err.message}`);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('Redis connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error(`Failed to connect to Redis: ${error.message}`);
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      await this.client.quit();
    }
  }

  private async ensureConnected(): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }
    try {
      await this.client.ping();
      return true;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!(await this.ensureConnected())) {
      return null;
    }
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Redis get error: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    if (!(await this.ensureConnected())) {
      return;
    }
    try {
      if (expirySeconds) {
        await this.client.setEx(key, expirySeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Redis set error: ${error.message}`);
    }
  }

  async incr(key: string): Promise<number> {
    if (!(await this.ensureConnected())) {
      return 0;
    }
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Redis incr error: ${error.message}`);
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (!(await this.ensureConnected())) {
      return;
    }
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Redis expire error: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!(await this.ensureConnected())) {
      return;
    }
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Redis del error: ${error.message}`);
    }
  }

  async exists(key: string): Promise<number> {
    if (!(await this.ensureConnected())) {
      return 0;
    }
    try {
      return await this.client.exists(key);
    } catch (error) {
      this.logger.error(`Redis exists error: ${error.message}`);
      return 0;
    }
  }
}
