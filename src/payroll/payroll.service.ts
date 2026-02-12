import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';

@Injectable()
export class PayrollService {
  private readonly TAX_RATE = 0.15;
  private readonly SOCIAL_SECURITY_RATE = 0.062;
  private readonly HEALTH_INSURANCE_RATE = 0.05;

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  calculatePayroll(grossSalary: number) {
    const incomeTax = grossSalary * this.TAX_RATE;
    const socialSecurity = grossSalary * this.SOCIAL_SECURITY_RATE;
    const healthInsurance = grossSalary * this.HEALTH_INSURANCE_RATE;
    const totalDeductions = incomeTax + socialSecurity + healthInsurance;
    const deductionPercentage = (totalDeductions / grossSalary) * 100;
    const netSalary = grossSalary - totalDeductions;

    return {
      grossSalary,
      incomeTax: parseFloat(incomeTax.toFixed(2)),
      socialSecurity: parseFloat(socialSecurity.toFixed(2)),
      healthInsurance: parseFloat(healthInsurance.toFixed(2)),
      totalDeductions: parseFloat(totalDeductions.toFixed(2)),
      deductionPercentage: parseFloat(deductionPercentage.toFixed(2)),
      netSalary: parseFloat(netSalary.toFixed(2)),
    };
  }

  async createEmployee(businessId: string, userId: string, data: any) {
    const employee = await this.prisma.employee.create({
      data: {
        businessId,
        name: data.name,
        email: data.email,
        position: data.position,
        monthlySalary: data.monthlySalary,
      },
    });

    await this.auditService.log({
      userId,
      action: 'EMPLOYEE_CREATED',
      entity: 'Employee',
      entityId: employee.id,
    });

    return employee;
  }

  async getEmployees(businessId: string) {
    return this.prisma.employee.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processPayroll(businessId: string, userId: string, employeeId: string, month: string, year: number) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new Error('Employee not found');
    }

    const existing = await this.prisma.payrollRecord.findFirst({
      where: { employeeId, month, year },
    });
    if (existing) {
      throw new Error('Payroll already processed for this period');
    }

    const payrollData = this.calculatePayroll(employee.monthlySalary);

    const record = await this.prisma.payrollRecord.create({
      data: {
        businessId,
        employeeId,
        userId,
        month,
        year,
        ...payrollData,
      },
    });

    await this.auditService.log({
      userId,
      action: 'PAYROLL_PROCESSED',
      entity: 'PayrollRecord',
      entityId: record.id,
      details: `Employee: ${employee.name}, Month: ${month} ${year}`,
    });

    return record;
  }

  async getPayrollRecords(businessId: string) {
    return this.prisma.payrollRecord.findMany({
      where: { businessId },
      include: { employee: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async getEmployeePayrollHistory(employeeId: string) {
    return this.prisma.payrollRecord.findMany({
      where: { employeeId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }
}
