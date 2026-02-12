import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
export declare class InventoryService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    createProduct(businessId: string, userId: string, data: any): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sku: string;
        price: number;
        stockQuantity: number;
        lowStockAlert: number;
    }>;
    getProducts(businessId: string): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sku: string;
        price: number;
        stockQuantity: number;
        lowStockAlert: number;
    }[]>;
    getProduct(id: string): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sku: string;
        price: number;
        stockQuantity: number;
        lowStockAlert: number;
    }>;
    updateProduct(id: string, userId: string, data: any): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sku: string;
        price: number;
        stockQuantity: number;
        lowStockAlert: number;
    }>;
    getLowStockProducts(businessId: string): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sku: string;
        price: number;
        stockQuantity: number;
        lowStockAlert: number;
    }[]>;
    adjustStock(id: string, userId: string, adjustment: number, reason: string): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sku: string;
        price: number;
        stockQuantity: number;
        lowStockAlert: number;
    }>;
    getInventoryValue(businessId: string): Promise<number>;
}
