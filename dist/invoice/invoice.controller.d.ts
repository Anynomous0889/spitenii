import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class InvoiceController {
    private readonly invoiceService;
    private readonly prisma;
    constructor(invoiceService: InvoiceService, prisma: PrismaService);
    createInvoice(req: any, body: CreateInvoiceDto): Promise<{
        customer: {
            id: string;
            email: string;
            businessId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            address: string | null;
            totalSpent: number;
            lifetimeValue: number;
        };
        items: ({
            product: {
                id: string;
                businessId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                sku: string;
                price: number;
                stockQuantity: number;
                lowStockAlert: number;
            };
        } & {
            id: string;
            createdAt: Date;
            price: number;
            total: number;
            quantity: number;
            productId: string;
            invoiceId: string;
        })[];
    } & {
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        invoiceNumber: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        subtotal: number;
        tax: number;
        total: number;
        dueDate: Date;
        paidAt: Date | null;
        sentAt: Date | null;
        customerId: string;
    }>;
    getInvoices(req: any, filters: any): Promise<({
        customer: {
            id: string;
            email: string;
            businessId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            address: string | null;
            totalSpent: number;
            lifetimeValue: number;
        };
        items: ({
            product: {
                id: string;
                businessId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                sku: string;
                price: number;
                stockQuantity: number;
                lowStockAlert: number;
            };
        } & {
            id: string;
            createdAt: Date;
            price: number;
            total: number;
            quantity: number;
            productId: string;
            invoiceId: string;
        })[];
    } & {
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        invoiceNumber: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        subtotal: number;
        tax: number;
        total: number;
        dueDate: Date;
        paidAt: Date | null;
        sentAt: Date | null;
        customerId: string;
    })[]>;
    getInvoice(req: any, id: string): Promise<{
        business: {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            address: string | null;
            taxRate: number;
        };
        customer: {
            id: string;
            email: string;
            businessId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            address: string | null;
            totalSpent: number;
            lifetimeValue: number;
        };
        items: ({
            product: {
                id: string;
                businessId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                sku: string;
                price: number;
                stockQuantity: number;
                lowStockAlert: number;
            };
        } & {
            id: string;
            createdAt: Date;
            price: number;
            total: number;
            quantity: number;
            productId: string;
            invoiceId: string;
        })[];
    } & {
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        invoiceNumber: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        subtotal: number;
        tax: number;
        total: number;
        dueDate: Date;
        paidAt: Date | null;
        sentAt: Date | null;
        customerId: string;
    }>;
    sendInvoice(req: any, id: string): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        invoiceNumber: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        subtotal: number;
        tax: number;
        total: number;
        dueDate: Date;
        paidAt: Date | null;
        sentAt: Date | null;
        customerId: string;
    }>;
    markAsPaid(req: any, id: string): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        invoiceNumber: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        subtotal: number;
        tax: number;
        total: number;
        dueDate: Date;
        paidAt: Date | null;
        sentAt: Date | null;
        customerId: string;
    }>;
}
