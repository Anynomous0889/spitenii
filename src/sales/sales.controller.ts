import { Controller, Get, Post, Body, Param, UseGuards, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getSales(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.salesService.getSales(user.businessId);
  }

  @Get('stats')
  async getStats(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.salesService.getRevenueStats(user.businessId);
  }

  @Get('customers')
  async getCustomers(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.salesService.getCustomers(user.businessId);
  }

  @Post('customers')
  @Roles('OWNER', 'MANAGER')
  async createCustomer(@Req() req: any, @Body() body: CreateCustomerDto) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.salesService.createCustomer(user.businessId, body);
  }

  @Get('customers/:id')
  async getCustomer(@Req() req: any, @Param('id') id: string) {
    if (!id || typeof id !== 'string' || id.length > 100) {
      throw new BadRequestException('Invalid customer ID');
    }
    const customer = await this.salesService.getCustomer(id);
    if (!customer) {
      throw new BadRequestException('Customer not found');
    }
    // Verify user has access to this customer's business
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (customer.businessId !== user?.businessId) {
      throw new ForbiddenException('Access denied');
    }
    return customer;
  }
}
