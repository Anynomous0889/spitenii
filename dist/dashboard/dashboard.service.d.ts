import { PrismaService } from '../prisma/prisma.service';
import { SalesService } from '../sales/sales.service';
import { ExpenseService } from '../expense/expense.service';
import { InventoryService } from '../inventory/inventory.service';
export declare class DashboardService {
    private readonly prisma;
    private readonly salesService;
    private readonly expenseService;
    private readonly inventoryService;
    constructor(prisma: PrismaService, salesService: SalesService, expenseService: ExpenseService, inventoryService: InventoryService);
    getDashboardData(businessId: string): Promise<{
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
