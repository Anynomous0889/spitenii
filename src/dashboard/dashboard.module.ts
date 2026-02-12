import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { SalesModule } from '../sales/sales.module';
import { ExpenseModule } from '../expense/expense.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [SalesModule, ExpenseModule, InventoryModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
