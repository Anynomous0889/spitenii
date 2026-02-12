import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
export declare class ExpenseService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    createExpense(businessId: string, userId: string, data: any): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string;
        amount: number;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        expenseDate: Date;
    }>;
    getExpenses(businessId: string, filters?: any): Promise<({
        user: {
            email: string;
        };
    } & {
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string;
        amount: number;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        expenseDate: Date;
    })[]>;
    getExpensesByCategory(businessId: string, month?: Date): Promise<{
        category: import(".prisma/client").$Enums.ExpenseCategory;
        total: number;
    }[]>;
    getMonthlyExpenses(businessId: string): Promise<{
        thisMonth: number;
        lastMonth: number;
    }>;
}
