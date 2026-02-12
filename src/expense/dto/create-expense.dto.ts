import { IsEnum, IsNumber, IsString, IsDateString, Min, MaxLength } from 'class-validator';
import { ExpenseCategory } from '@prisma/client';

export class CreateExpenseDto {
  @IsEnum(ExpenseCategory, { message: 'Invalid expense category' })
  category: ExpenseCategory;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description: string;

  @IsDateString({}, { message: 'Invalid expense date format' })
  expenseDate: string;
}
