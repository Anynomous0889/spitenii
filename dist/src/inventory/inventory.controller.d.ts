import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
declare class AdjustStockDto {
    adjustment: number;
    reason: string;
}
export declare class InventoryController {
    private readonly inventoryService;
    private readonly prisma;
    constructor(inventoryService: InventoryService, prisma: PrismaService);
    createProduct(req: any, body: CreateProductDto): Promise<{
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
    getProducts(req: any): Promise<{
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
    getProduct(req: any, id: string): Promise<{
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
    updateProduct(req: any, id: string, body: Partial<CreateProductDto>): Promise<{
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
    getLowStock(req: any): Promise<{
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
    adjustStock(req: any, id: string, body: AdjustStockDto): Promise<{
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
    getInventoryValue(req: any): Promise<{
        value: number;
    }>;
}
export {};
