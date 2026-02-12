import { Controller, Get, Post, Body, UseGuards, Req, Query, ForbiddenException } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpenseController {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles('OWNER', 'MANAGER', 'ACCOUNTANT')
  async createExpense(@Req() req: any, @Body() body: CreateExpenseDto) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.expenseService.createExpense(user.businessId, req.user.userId, body);
  }

  @Get()
  async getExpenses(@Req() req: any, @Query() filters: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.expenseService.getExpenses(user.businessId, filters);
  }

  @Get('by-category')
  async getByCategory(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.expenseService.getExpensesByCategory(user.businessId);
  }

  @Get('monthly')
  async getMonthly(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.expenseService.getMonthlyExpenses(user.businessId);
  }
}
