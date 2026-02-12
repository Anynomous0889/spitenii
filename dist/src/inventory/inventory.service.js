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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../security/audit.service");
let InventoryService = class InventoryService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async createProduct(businessId, userId, data) {
        const product = await this.prisma.product.create({
            data: {
                businessId,
                name: data.name,
                sku: data.sku,
                price: data.price,
                stockQuantity: data.stockQuantity || 0,
                lowStockAlert: data.lowStockAlert || 10,
            },
        });
        await this.auditService.log({
            userId,
            action: 'PRODUCT_CREATED',
            entity: 'Product',
            entityId: product.id,
        });
        return product;
    }
    async getProducts(businessId) {
        return this.prisma.product.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getProduct(id) {
        return this.prisma.product.findUnique({ where: { id } });
    }
    async updateProduct(id, userId, data) {
        const product = await this.prisma.product.update({
            where: { id },
            data,
        });
        await this.auditService.log({
            userId,
            action: 'PRODUCT_UPDATED',
            entity: 'Product',
            entityId: id,
        });
        return product;
    }
    async getLowStockProducts(businessId) {
        return this.prisma.product.findMany({
            where: {
                businessId,
                stockQuantity: { lte: this.prisma.product.fields.lowStockAlert },
            },
        });
    }
    async adjustStock(id, userId, adjustment, reason) {
        const product = await this.prisma.product.update({
            where: { id },
            data: { stockQuantity: { increment: adjustment } },
        });
        await this.auditService.log({
            userId,
            action: 'STOCK_ADJUSTED',
            entity: 'Product',
            entityId: id,
            details: `Adjustment: ${adjustment}, Reason: ${reason}`,
        });
        return product;
    }
    async getInventoryValue(businessId) {
        const products = await this.prisma.product.findMany({ where: { businessId } });
        return products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map