import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
export declare class PayrollService {
    private readonly prisma;
    private readonly auditService;
    private readonly TAX_RATE;
    private readonly SOCIAL_SECURITY_RATE;
    private readonly HEALTH_INSURANCE_RATE;
    constructor(prisma: PrismaService, auditService: AuditService);
    calculatePayroll(grossSalary: number): {
        grossSalary: number;
        incomeTax: number;
        socialSecurity: number;
        healthInsurance: number;
        totalDeductions: number;
        deductionPercentage: number;
        netSalary: number;
    };
    createEmployee(businessId: string, userId: string, data: any): Promise<{
        id: string;
        email: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        position: string;
        monthlySalary: number;
    }>;
    getEmployees(businessId: string): Promise<{
        id: string;
        email: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        position: string;
        monthlySalary: number;
    }[]>;
    processPayroll(businessId: string, userId: string, employeeId: string, month: string, year: number): Promise<{
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
    getPayrollRecords(businessId: string): Promise<({
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
    getEmployeePayrollHistory(employeeId: string): Promise<{
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
