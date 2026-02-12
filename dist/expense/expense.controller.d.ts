import { ExpenseService } from './expense.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
export declare class ExpenseController {
    private readonly expenseService;
    private readonly prisma;
    constructor(expenseService: ExpenseService, prisma: PrismaService);
    createExpense(req: any, body: CreateExpenseDto): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: number;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        description: string;
        expenseDate: Date;
    }>;
    getExpenses(req: any, filters: any): Promise<({
        user: {
            email: string;
        };
    } & {
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: number;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        description: string;
        expenseDate: Date;
    })[]>;
    getByCategory(req: any): Promise<{
        category: import(".prisma/client").$Enums.ExpenseCategory;
        total: number;
    }[]>;
    getMonthly(req: any): Promise<{
        thisMonth: number;
        lastMonth: number;
    }>;
}
