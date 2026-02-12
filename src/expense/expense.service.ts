import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';

@Injectable()
export class ExpenseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createExpense(businessId: string, userId: string, data: any) {
    const expense = await this.prisma.expense.create({
      data: {
        businessId,
        userId,
        category: data.category,
        amount: data.amount,
        description: data.description,
        expenseDate: new Date(data.expenseDate),
      },
    });

    await this.auditService.log({
      userId,
      action: 'EXPENSE_CREATED',
      entity: 'Expense',
      entityId: expense.id,
    });

    return expense;
  }

  async getExpenses(businessId: string, filters?: any) {
    return this.prisma.expense.findMany({
      where: { businessId, ...filters },
      include: { user: { select: { email: true } } },
      orderBy: { expenseDate: 'desc' },
    });
  }

  async getExpensesByCategory(businessId: string, month?: Date) {
    const startDate = month || new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await this.prisma.expense.groupBy({
      by: ['category'],
      where: {
        businessId,
        expenseDate: { gte: startDate, lt: endDate },
      },
      _sum: { amount: true },
    });

    return expenses.map(e => ({
      category: e.category,
      total: e._sum.amount || 0,
    }));
  }

  async getMonthlyExpenses(businessId: string) {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const thisMonthTotal = await this.prisma.expense.aggregate({
      where: { businessId, expenseDate: { gte: thisMonth } },
      _sum: { amount: true },
    });

    const lastMonthTotal = await this.prisma.expense.aggregate({
      where: {
        businessId,
        expenseDate: { gte: lastMonth, lt: thisMonth },
      },
      _sum: { amount: true },
    });

    return {
      thisMonth: thisMonthTotal._sum.amount || 0,
      lastMonth: lastMonthTotal._sum.amount || 0,
    };
  }
}
