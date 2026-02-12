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
exports.SalesController = void 0;
const common_1 = require("@nestjs/common");
const sales_service_1 = require("./sales.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const create_customer_dto_1 = require("./dto/create-customer.dto");
let SalesController = class SalesController {
    constructor(salesService, prisma) {
        this.salesService = salesService;
        this.prisma = prisma;
    }
    async getSales(req) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.salesService.getSales(user.businessId);
    }
    async getStats(req) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.salesService.getRevenueStats(user.businessId);
    }
    async getCustomers(req) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.salesService.getCustomers(user.businessId);
    }
    async createCustomer(req, body) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.salesService.createCustomer(user.businessId, body);
    }
    async getCustomer(req, id) {
        if (!id || typeof id !== 'string' || id.length > 100) {
            throw new common_1.BadRequestException('Invalid customer ID');
        }
        const customer = await this.salesService.getCustomer(id);
        if (!customer) {
            throw new common_1.BadRequestException('Customer not found');
        }
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (customer.businessId !== user?.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return customer;
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getSales", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('customers'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getCustomers", null);
__decorate([
    (0, common_1.Post)('customers'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_customer_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Get)('customers/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getCustomer", null);
exports.SalesController = SalesController = __decorate([
    (0, common_1.Controller)('sales'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [sales_service_1.SalesService,
        prisma_service_1.PrismaService])
], SalesController);
//# sourceMappingURL=sales.controller.js.map