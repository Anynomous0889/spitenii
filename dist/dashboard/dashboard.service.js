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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sales_service_1 = require("../sales/sales.service");
const expense_service_1 = require("../expense/expense.service");
const inventory_service_1 = require("../inventory/inventory.service");
let DashboardService = class DashboardService {
    constructor(prisma, salesService, expenseService, inventoryService) {
        this.prisma = prisma;
        this.salesService = salesService;
        this.expenseService = expenseService;
        this.inventoryService = inventoryService;
    }
    async getDashboardData(businessId) {
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sales_service_1.SalesService,
        expense_service_1.ExpenseService,
        inventory_service_1.InventoryService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map