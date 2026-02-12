import { PrismaService } from '../prisma/prisma.service';
export declare class SalesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSales(businessId: string, filters?: any): Promise<({
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
        invoice: {
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
        };
    } & {
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        invoiceId: string;
        amount: number;
        saleDate: Date;
    })[]>;
    getCustomers(businessId: string): Promise<{
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
    }[]>;
    createCustomer(businessId: string, data: any): Promise<{
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
    }>;
    getCustomer(id: string): Promise<{
        invoices: {
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
        }[];
        sales: {
            id: string;
            businessId: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            invoiceId: string;
            amount: number;
            saleDate: Date;
        }[];
    } & {
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
    }>;
    getRevenueStats(businessId: string): Promise<{
        thisMonth: number;
        thisYear: number;
        salesCount: number;
        growthPercentage: string;
    }>;
}
