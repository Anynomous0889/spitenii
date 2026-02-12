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
exports.ExpenseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../security/audit.service");
let ExpenseService = class ExpenseService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async createExpense(businessId, userId, data) {
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
    async getExpenses(businessId, filters) {
        return this.prisma.expense.findMany({
            where: { businessId, ...filters },
            include: { user: { select: { email: true } } },
            orderBy: { expenseDate: 'desc' },
        });
    }
    async getExpensesByCategory(businessId, month) {
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
    async getMonthlyExpenses(businessId) {
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
};
exports.ExpenseService = ExpenseService;
exports.ExpenseService = ExpenseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ExpenseService);
//# sourceMappingURL=expense.service.js.map