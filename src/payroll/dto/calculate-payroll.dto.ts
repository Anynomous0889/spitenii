import { IsNumber, Min, Max, IsString, IsUUID, IsInt, Matches } from 'class-validator';

export class CalculatePayrollDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Gross salary must be greater than or equal to 0' })
  grossSalary: number;
}

export class ProcessPayrollDto {
  @IsString()
  @IsUUID(4, { message: 'Invalid employee ID format' })
  employeeId: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Month must be in YYYY-MM format' })
  month: string;

  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;
}
