import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SalesService } from '../sales/sales.service';
import { ExpenseService } from '../expense/expense.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salesService: SalesService,
    private readonly expenseService: ExpenseService,
    private readonly inventoryService: InventoryService,
  ) {}

  async getDashboardData(businessId: string) {
    const revenueStats = await this.salesService.getRevenueStats(businessId);
    const expenseStats = await this.expenseService.getMonthlyExpenses(businessId);
    const expensesByCategory = await this.expenseService.getExpensesByCategory(businessId);
    const inventoryValue = await this.inventoryService.getInventoryValue(businessId);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const unpaidInvoices = await this.prisma.invoice.findMany({
      where: {
        businessId,
        status: { in: ['SENT', 'OVERDUE'] },
      },
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        status: true,
        dueDate: true,
      },
    });

    const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const lowStockProducts = await this.prisma.product.findMany({
      where: {
        businessId,
        stockQuantity: { lte: 10 },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        lowStockAlert: true,
      },
    });

    const recentInvoices = await this.prisma.invoice.findMany({
      where: { businessId },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentSales = await this.prisma.sale.findMany({
      where: { businessId },
      include: { customer: { select: { name: true } } },
      orderBy: { saleDate: 'desc' },
      take: 5,
    });

    const profit = revenueStats.thisMonth - expenseStats.thisMonth;

    return {
      revenue: {
        thisMonth: revenueStats.thisMonth,
        thisYear: revenueStats.thisYear,
        growth: revenueStats.growthPercentage,
      },
      expenses: {
        thisMonth: expenseStats.thisMonth,
        lastMonth: expenseStats.lastMonth,
        byCategory: expensesByCategory,
      },
      profit,
      unpaidInvoices: {
        count: unpaidInvoices.length,
        total: unpaidTotal,
        invoices: unpaidInvoices,
      },
      inventory: {
        value: inventoryValue,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
      },
      recentActivity: {
        invoices: recentInvoices,
        sales: recentSales,
      },
    };
  }
}
