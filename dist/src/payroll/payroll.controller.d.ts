import { PayrollService } from './payroll.service';
import { PrismaService } from '../prisma/prisma.service';
import { CalculatePayrollDto, ProcessPayrollDto } from './dto/calculate-payroll.dto';
declare class CreateEmployeeDto {
    name: string;
    email: string;
    position: string;
    monthlySalary: number;
}
export declare class PayrollController {
    private readonly payrollService;
    private readonly prisma;
    constructor(payrollService: PayrollService, prisma: PrismaService);
    calculatePayroll(body: CalculatePayrollDto): {
        grossSalary: number;
        incomeTax: number;
        socialSecurity: number;
        healthInsurance: number;
        totalDeductions: number;
        deductionPercentage: number;
        netSalary: number;
    };
    createEmployee(req: any, body: CreateEmployeeDto): Promise<{
        id: string;
        email: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        position: string;
        monthlySalary: number;
    }>;
    getEmployees(req: any): Promise<{
        id: string;
        email: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        position: string;
        monthlySalary: number;
    }[]>;
    processPayroll(req: any, body: ProcessPayrollDto): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        employeeId: string;
        grossSalary: number;
        incomeTax: number;
        socialSecurity: number;
        healthInsurance: number;
        totalDeductions: number;
        deductionPercentage: number;
        netSalary: number;
        month: string;
        year: number;
    }>;
    getPayrollRecords(req: any): Promise<({
        employee: {
            id: string;
            email: string;
            businessId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            position: string;
            monthlySalary: number;
        };
    } & {
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        employeeId: string;
        grossSalary: number;
        incomeTax: number;
        socialSecurity: number;
        healthInsurance: number;
        totalDeductions: number;
        deductionPercentage: number;
        netSalary: number;
        month: string;
        year: number;
    })[]>;
    getEmployeeHistory(req: any, id: string): Promise<{
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        employeeId: string;
        grossSalary: number;
        incomeTax: number;
        socialSecurity: number;
        healthInsurance: number;
        totalDeductions: number;
        deductionPercentage: number;
        netSalary: number;
        month: string;
        year: number;
    }[]>;
}
export {};
