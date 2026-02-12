import { SalesService } from './sales.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
export declare class SalesController {
    private readonly salesService;
    private readonly prisma;
    constructor(salesService: SalesService, prisma: PrismaService);
    getSales(req: any): Promise<({
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
    getStats(req: any): Promise<{
        thisMonth: number;
        thisYear: number;
        salesCount: number;
        growthPercentage: string;
    }>;
    getCustomers(req: any): Promise<{
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
    createCustomer(req: any, body: CreateCustomerDto): Promise<{
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
    getCustomer(req: any, id: string): Promise<{
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
}
