import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async getSales(businessId: string, filters?: any) {
    return this.prisma.sale.findMany({
      where: { businessId, ...filters },
      include: {
        customer: true,
        invoice: true,
      },
      orderBy: { saleDate: 'desc' },
    });
  }

  async getCustomers(businessId: string) {
    return this.prisma.customer.findMany({
      where: { businessId },
      orderBy: { totalSpent: 'desc' },
    });
  }

  async createCustomer(businessId: string, data: any) {
    return this.prisma.customer.create({
      data: {
        businessId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });
  }

  async getCustomer(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        sales: { orderBy: { saleDate: 'desc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async getRevenueStats(businessId: string) {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisYear = new Date(thisMonth);
    thisYear.setMonth(0);

    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const monthSales = await this.prisma.sale.aggregate({
      where: { businessId, saleDate: { gte: thisMonth } },
      _sum: { amount: true },
      _count: true,
    });

    const yearSales = await this.prisma.sale.aggregate({
      where: { businessId, saleDate: { gte: thisYear } },
      _sum: { amount: true },
    });

    const lastMonthSales = await this.prisma.sale.aggregate({
      where: {
        businessId,
        saleDate: { gte: lastMonth, lt: thisMonth },
      },
      _sum: { amount: true },
    });

    const growth = lastMonthSales._sum.amount
      ? ((monthSales._sum.amount || 0) - lastMonthSales._sum.amount) / lastMonthSales._sum.amount * 100
      : 0;

    return {
      thisMonth: monthSales._sum.amount || 0,
      thisYear: yearSales._sum.amount || 0,
      salesCount: monthSales._count,
      growthPercentage: growth.toFixed(2),
    };
  }
}
