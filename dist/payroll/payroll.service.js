"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../security/audit.service");
let PayrollService = class PayrollService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.TAX_RATE = 0.15;
        this.SOCIAL_SECURITY_RATE = 0.062;
        this.HEALTH_INSURANCE_RATE = 0.05;
    }
    calculatePayroll(grossSalary) {
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
    async createEmployee(businessId, userId, data) {
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
    async getEmployees(businessId) {
        return this.prisma.employee.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async processPayroll(businessId, userId, employeeId, month, year) {
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
    async getPayrollRecords(businessId) {
        return this.prisma.payrollRecord.findMany({
            where: { businessId },
            include: { employee: true },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
        });
    }
    async getEmployeePayrollHistory(employeeId) {
        return this.prisma.payrollRecord.findMany({
            where: { employeeId },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
        });
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map