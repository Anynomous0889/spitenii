"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SalesService = class SalesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSales(businessId, filters) {
        return this.prisma.sale.findMany({
            where: { businessId, ...filters },
            include: {
                customer: true,
                invoice: true,
            },
            orderBy: { saleDate: 'desc' },
        });
    }
    async getCustomers(businessId) {
        return this.prisma.customer.findMany({
            where: { businessId },
            orderBy: { totalSpent: 'desc' },
        });
    }
    async createCustomer(businessId, data) {
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
    async getCustomer(id) {
        return this.prisma.customer.findUnique({
            where: { id },
            include: {
                sales: { orderBy: { saleDate: 'desc' } },
                invoices: { orderBy: { createdAt: 'desc' } },
            },
        });
    }
    async getRevenueStats(businessId) {
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
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesService);
//# sourceMappingURL=sales.service.js.map