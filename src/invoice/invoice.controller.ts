import { Controller, Post, Get, Body, Param, UseGuards, Req, Query, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  async createInvoice(@Req() req: any, @Body() body: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(req.user.userId, body);
  }

  @Get()
  async getInvoices(@Req() req: any, @Query() filters: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.invoiceService.getInvoices(user.businessId, filters);
  }

  @Get(':id')
  async getInvoice(@Req() req: any, @Param('id') id: string) {
    if (!id || typeof id !== 'string' || id.length > 100) {
      throw new BadRequestException('Invalid invoice ID');
    }
    const invoice = await this.invoiceService.getInvoice(id);
    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }
    // Verify user has access to this invoice's business
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (invoice.businessId !== user?.businessId) {
      throw new ForbiddenException('Access denied');
    }
    return invoice;
  }

  @Post(':id/send')
  @Roles('OWNER', 'MANAGER')
  async sendInvoice(@Req() req: any, @Param('id') id: string) {
    if (!id || typeof id !== 'string' || id.length > 100) {
      throw new BadRequestException('Invalid invoice ID');
    }
    // Verify ownership before sending
    const invoice = await this.invoiceService.getInvoice(id);
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (invoice?.businessId !== user?.businessId) {
      throw new ForbiddenException('Access denied');
    }
    return this.invoiceService.sendInvoice(req.user.userId, id);
  }

  @Post(':id/mark-paid')
  @Roles('OWNER', 'MANAGER', 'ACCOUNTANT')
  async markAsPaid(@Req() req: any, @Param('id') id: string) {
    if (!id || typeof id !== 'string' || id.length > 100) {
      throw new BadRequestException('Invalid invoice ID');
    }
    // Verify ownership before marking as paid
    const invoice = await this.invoiceService.getInvoice(id);
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (invoice?.businessId !== user?.businessId) {
      throw new ForbiddenException('Access denied');
    }
    return this.invoiceService.markAsPaid(req.user.userId, id);
  }
}
