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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const payroll_service_1 = require("./payroll.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const calculate_payroll_dto_1 = require("./dto/calculate-payroll.dto");
const class_validator_1 = require("class-validator");
class CreateEmployeeDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "monthlySalary", void 0);
let PayrollController = class PayrollController {
    constructor(payrollService, prisma) {
        this.payrollService = payrollService;
        this.prisma = prisma;
    }
    calculatePayroll(body) {
        return this.payrollService.calculatePayroll(body.grossSalary);
    }
    async createEmployee(req, body) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.payrollService.createEmployee(user.businessId, req.user.userId, body);
    }
    async getEmployees(req) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.payrollService.getEmployees(user.businessId);
    }
    async processPayroll(req, body) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.payrollService.processPayroll(user.businessId, req.user.userId, body.employeeId, body.month, body.year);
    }
    async getPayrollRecords(req) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user?.businessId) {
            throw new common_1.ForbiddenException('User not associated with a business');
        }
        return this.payrollService.getPayrollRecords(user.businessId);
    }
    async getEmployeeHistory(req, id) {
        if (!id || typeof id !== 'string' || id.length > 100) {
            throw new common_1.BadRequestException('Invalid employee ID');
        }
        const employee = await this.prisma.employee.findUnique({ where: { id } });
        const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!employee || employee.businessId !== user?.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.payrollService.getEmployeePayrollHistory(id);
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_payroll_dto_1.CalculatePayrollDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "calculatePayroll", null);
__decorate([
    (0, common_1.Post)('employees'),
    (0, roles_decorator_1.Roles)('OWNER', 'HR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateEmployeeDto]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "createEmployee", null);
__decorate([
    (0, common_1.Get)('employees'),
    (0, roles_decorator_1.Roles)('OWNER', 'HR', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getEmployees", null);
__decorate([
    (0, common_1.Post)('process'),
    (0, roles_decorator_1.Roles)('OWNER', 'HR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, calculate_payroll_dto_1.ProcessPayrollDto]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "processPayroll", null);
__decorate([
    (0, common_1.Get)('records'),
    (0, roles_decorator_1.Roles)('OWNER', 'HR', 'ACCOUNTANT'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollRecords", null);
__decorate([
    (0, common_1.Get)('employees/:id/history'),
    (0, roles_decorator_1.Roles)('OWNER', 'HR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getEmployeeHistory", null);
exports.PayrollController = PayrollController = __decorate([
    (0, common_1.Controller)('payroll'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService,
        prisma_service_1.PrismaService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map