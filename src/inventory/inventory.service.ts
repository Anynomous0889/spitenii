import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createProduct(businessId: string, userId: string, data: any) {
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

  async getProducts(businessId: string) {
    return this.prisma.product.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProduct(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async updateProduct(id: string, userId: string, data: any) {
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

  async getLowStockProducts(businessId: string) {
    return this.prisma.product.findMany({
      where: {
        businessId,
        stockQuantity: { lte: this.prisma.product.fields.lowStockAlert },
      },
    });
  }

  async adjustStock(id: string, userId: string, adjustment: number, reason: string) {
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

  async getInventoryValue(businessId: string): Promise<number> {
    const products = await this.prisma.product.findMany({ where: { businessId } });
    return products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0);
  }
}
