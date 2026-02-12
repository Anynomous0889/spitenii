import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
import { PdfService } from './pdf.service';
import { EmailService } from '../auth/email.service';
export declare class InvoiceService {
    private readonly prisma;
    private readonly auditService;
    private readonly pdfService;
    private readonly emailService;
    constructor(prisma: PrismaService, auditService: AuditService, pdfService: PdfService, emailService: EmailService);
    createInvoice(userId: string, data: any): Promise<{
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
    getInvoices(businessId: string, filters?: any): Promise<({
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
    getInvoice(id: string): Promise<{
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
    sendInvoice(userId: string, invoiceId: string): Promise<{
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
    markAsPaid(userId: string, invoiceId: string): Promise<{
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
    checkOverdueInvoices(): Promise<void>;
}
