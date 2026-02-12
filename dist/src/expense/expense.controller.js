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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseController = void 0;
const common_1 = require("@nestjs/common");
const expense_service_1 = require("./expense.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const create_expense_dto_1 = require("./dto/create-expense.dto");
let ExpenseController = class ExpenseController {
    constructor(expenseService, prisma) {
        this.expenseService = expenseService;
        this.prisma = prisma;
    }
    async createExpense(req, body) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.expenseService.createExpense(user.businessId, req.user.userId, body);
    }
    async getExpenses(req, filters) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.expenseService.getExpenses(user.businessId, filters);
    }
    async getByCategory(req) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.expenseService.getExpensesByCategory(user.businessId);
    }
    async getMonthly(req) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.expenseService.getMonthlyExpenses(user.businessId);
    }
};
exports.ExpenseController = ExpenseController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'ACCOUNTANT'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_expense_dto_1.CreateExpenseDto]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "createExpense", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "getExpenses", null);
__decorate([
    (0, common_1.Get)('by-category'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "getByCategory", null);
__decorate([
    (0, common_1.Get)('monthly'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "getMonthly", null);
exports.ExpenseController = ExpenseController = __decorate([
    (0, common_1.Controller)('expenses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [expense_service_1.ExpenseService,
        prisma_service_1.PrismaService])
], ExpenseController);
//# sourceMappingURL=expense.controller.js.map