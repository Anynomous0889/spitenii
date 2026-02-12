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
exports.InvoiceController = void 0;
const common_1 = require("@nestjs/common");
const invoice_service_1 = require("./invoice.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const create_invoice_dto_1 = require("./dto/create-invoice.dto");
const prisma_service_1 = require("../prisma/prisma.service");
let InvoiceController = class InvoiceController {
    constructor(invoiceService, prisma) {
        this.invoiceService = invoiceService;
        this.prisma = prisma;
    }
    async createInvoice(req, body) {
        return this.invoiceService.createInvoice(req.user.userId, body);
    }
    async getInvoices(req, filters) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.invoiceService.getInvoices(user.businessId, filters);
    }
    async getInvoice(req, id) {
        if (!id || typeof id !== 'string' || id.length > 100) {
            throw new common_1.BadRequestException('Invalid invoice ID');
        }
        const invoice = await this.invoiceService.getInvoice(id);
        if (!invoice) {
            throw new common_1.BadRequestException('Invoice not found');
        }
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (invoice.businessId !== user?.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return invoice;
    }
    async sendInvoice(req, id) {
        if (!id || typeof id !== 'string' || id.length > 100) {
            throw new common_1.BadRequestException('Invalid invoice ID');
        }
        const invoice = await this.invoiceService.getInvoice(id);
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (invoice?.businessId !== user?.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.invoiceService.sendInvoice(req.user.userId, id);
    }
    async markAsPaid(req, id) {
        if (!id || typeof id !== 'string' || id.length > 100) {
            throw new common_1.BadRequestException('Invalid invoice ID');
        }
        const invoice = await this.invoiceService.getInvoice(id);
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (invoice?.businessId !== user?.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.invoiceService.markAsPaid(req.user.userId, id);
    }
};
exports.InvoiceController = InvoiceController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_invoice_dto_1.CreateInvoiceDto]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Post)(':id/send'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "sendInvoice", null);
__decorate([
    (0, common_1.Post)(':id/mark-paid'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER', 'ACCOUNTANT'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "markAsPaid", null);
exports.InvoiceController = InvoiceController = __decorate([
    (0, common_1.Controller)('invoices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [invoice_service_1.InvoiceService,
        prisma_service_1.PrismaService])
], InvoiceController);
//# sourceMappingURL=invoice.controller.js.map