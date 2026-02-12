import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardController {
    private readonly dashboardService;
    private readonly prisma;
    constructor(dashboardService: DashboardService, prisma: PrismaService);
    getDashboard(req: any): Promise<{
        revenue: {
            thisMonth: number;
            thisYear: number;
            growth: string;
        };
        expenses: {
            thisMonth: number;
            lastMonth: number;
            byCategory: {
                category: import(".prisma/client").$Enums.ExpenseCategory;
                total: number;
            }[];
        };
        profit: number;
        unpaidInvoices: {
            count: number;
            total: number;
            invoices: {
                id: string;
                invoiceNumber: string;
                status: import(".prisma/client").$Enums.InvoiceStatus;
                total: number;
                dueDate: Date;
            }[];
        };
        inventory: {
            value: number;
            lowStockCount: number;
            lowStockProducts: {
                id: string;
                name: string;
                sku: string;
                stockQuantity: number;
                lowStockAlert: number;
            }[];
        };
        recentActivity: {
            invoices: ({
                customer: {
                    name: string;
                };
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
            })[];
            sales: ({
                customer: {
                    name: string;
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
            })[];
        };
    }>;
}
