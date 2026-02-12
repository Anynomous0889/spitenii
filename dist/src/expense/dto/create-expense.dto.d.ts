import { ExpenseCategory } from '@prisma/client';
export declare class CreateExpenseDto {
    category: ExpenseCategory;
    amount: number;
    description: string;
    expenseDate: string;
}
