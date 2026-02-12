import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      // Optimize for serverless: use connection pooling
      // For Supabase, use the connection pooler URL (port 6543) instead of direct connection
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error(`Failed to connect to database: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Database disconnected');
    } catch (error) {
      this.logger.error(`Error disconnecting from database: ${error.message}`);
    }
  }

  // Helper method to ensure business ownership
  async verifyBusinessOwnership(userId: string, businessId: string): Promise<boolean> {
    const user = await this.user.findUnique({
      where: { id: userId },
      select: { businessId: true },
    });
    return user?.businessId === businessId;
  }
}
