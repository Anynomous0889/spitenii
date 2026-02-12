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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const class_validator_1 = require("class-validator");
class AdjustStockDto {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdjustStockDto.prototype, "adjustment", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], AdjustStockDto.prototype, "reason", void 0);
let InventoryController = class InventoryController {
    constructor(inventoryService, prisma) {
        this.inventoryService = inventoryService;
        this.prisma = prisma;
    }
    async createProduct(req, body) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.inventoryService.createProduct(user.businessId, req.user.userId, body);
    }
    async getProducts(req) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.inventoryService.getProducts(user.businessId);
    }
    async getProduct(req, id) {
        if (!id || typeof id !== 'string' || id.length > 100) {
            throw new common_1.BadRequestException('Invalid product ID');
        }
        const product = await this.inventoryService.getProduct(id);
        if (!product) {
            throw new common_1.BadRequestException('Product not found');
        }
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (product.businessId !== user?.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return product;
    }
    async updateProduct(req, id, body) {
        if (!id || typeof id !== 'string' || id.length > 100) {
            throw new common_1.BadRequestException('Invalid product ID');
        }
        const product = await this.inventoryService.getProduct(id);
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (product?.businessId !== user?.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.inventoryService.updateProduct(id, req.user.userId, body);
    }
    async getLowStock(req) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.inventoryService.getLowStockProducts(user.businessId);
    }
    async adjustStock(req, id, body) {
        if (!id || typeof id !== 'string' || id.length > 100) {
            throw new common_1.BadRequestException('Invalid product ID');
        }
        const product = await this.inventoryService.getProduct(id);
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (product?.businessId !== user?.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.inventoryService.adjustStock(id, req.user.userId, body.adjustment, body.reason);
    }
    async getInventoryValue(req) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        const value = await this.inventoryService.getInventoryValue(user.businessId);
        return { value };
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Post)('products'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('products/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Put)('products/:id'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Post)('products/:id/adjust-stock'),
    (0, roles_decorator_1.Roles)('OWNER', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, AdjustStockDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Get)('value'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventoryValue", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService,
        prisma_service_1.PrismaService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map