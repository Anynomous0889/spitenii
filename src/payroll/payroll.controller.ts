import { Controller, Get, Post, Body, Param, UseGuards, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CalculatePayrollDto, ProcessPayrollDto } from './dto/calculate-payroll.dto';
import { IsEmail, IsString, IsNumber, MinLength, MaxLength, Min } from 'class-validator';

class CreateEmployeeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MaxLength(255)
  position: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlySalary: number;
}

@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('calculate')
  calculatePayroll(@Body() body: CalculatePayrollDto) {
    return this.payrollService.calculatePayroll(body.grossSalary);
  }

  @Post('employees')
  @Roles('OWNER', 'HR')
  async createEmployee(@Req() req: any, @Body() body: CreateEmployeeDto) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.payrollService.createEmployee(user.businessId, req.user.userId, body);
  }

  @Get('employees')
  @Roles('OWNER', 'HR', 'MANAGER')
  async getEmployees(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.payrollService.getEmployees(user.businessId);
  }

  @Post('process')
  @Roles('OWNER', 'HR')
  async processPayroll(@Req() req: any, @Body() body: ProcessPayrollDto) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.payrollService.processPayroll(user.businessId, req.user.userId, body.employeeId, body.month, body.year);
  }

  @Get('records')
  @Roles('OWNER', 'HR', 'ACCOUNTANT')
  async getPayrollRecords(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.payrollService.getPayrollRecords(user.businessId);
  }

  @Get('employees/:id/history')
  @Roles('OWNER', 'HR')
  async getEmployeeHistory(@Req() req: any, @Param('id') id: string) {
    if (!id || typeof id !== 'string' || id.length > 100) {
      throw new BadRequestException('Invalid employee ID');
    }
    // Verify employee belongs to user's business
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!employee || employee.businessId !== user?.businessId) {
      throw new ForbiddenException('Access denied');
    }
    return this.payrollService.getEmployeePayrollHistory(id);
  }
}
