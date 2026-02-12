import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SecurityModule } from './security/security.module';
import { InvoiceModule } from './invoice/invoice.module';
import { SalesModule } from './sales/sales.module';
import { InventoryModule } from './inventory/inventory.module';
import { ExpenseModule } from './expense/expense.module';
import { PayrollModule } from './payroll/payroll.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    SecurityModule,
    InvoiceModule,
    SalesModule,
    InventoryModule,
    ExpenseModule,
    PayrollModule,
    DashboardModule,
    HealthModule,
    UsersModule,
  ],
})
export class AppModule {}
