import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
import { PdfService } from './pdf.service';
import { EmailService } from '../auth/email.service';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly pdfService: PdfService,
    private readonly emailService: EmailService,
  ) {}

  async createInvoice(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.businessId) {
      throw new BadRequestException('User not associated with a business');
    }

    const business = await this.prisma.business.findUnique({ where: { id: user.businessId } });
    const invoiceCount = await this.prisma.invoice.count({ where: { businessId: user.businessId } });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;

    let subtotal = 0;
    const items = [];

    for (const item of data.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }
      const itemTotal = item.quantity * product.price;
      subtotal += itemTotal;
      items.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      });
    }

    const tax = subtotal * (business?.taxRate || 0);
    const total = subtotal + tax;

    const invoice = await this.prisma.invoice.create({
      data: {
        businessId: user.businessId,
        customerId: data.customerId,
        userId,
        invoiceNumber,
        subtotal,
        tax,
        total,
        dueDate: new Date(data.dueDate),
        status: 'DRAFT',
        items: {
          create: items,
        },
      },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    });

    await this.auditService.log({
      userId,
      action: 'INVOICE_CREATED',
      entity: 'Invoice',
      entityId: invoice.id,
    });

    return invoice;
  }

  async getInvoices(businessId: string, filters?: any) {
    return this.prisma.invoice.findMany({
      where: { businessId, ...filters },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoice(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
        business: true,
      },
    });
  }

  async sendInvoice(userId: string, invoiceId: string) {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    for (const item of invoice.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);
    await this.emailService.sendInvoiceEmail(invoice.customer.email, pdfBuffer, invoice.invoiceNumber);

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'SENT', sentAt: new Date() },
    });

    await this.auditService.log({
      userId,
      action: 'INVOICE_SENT',
      entity: 'Invoice',
      entityId: invoiceId,
    });

    return updatedInvoice;
  }

  async markAsPaid(userId: string, invoiceId: string) {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID', paidAt: new Date() },
    });

    await this.prisma.sale.create({
      data: {
        businessId: invoice.businessId,
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        amount: invoice.total,
        saleDate: new Date(),
      },
    });

    await this.prisma.customer.update({
      where: { id: invoice.customerId },
      data: {
        totalSpent: { increment: invoice.total },
        lifetimeValue: { increment: invoice.total },
      },
    });

    await this.auditService.log({
      userId,
      action: 'INVOICE_PAID',
      entity: 'Invoice',
      entityId: invoiceId,
      details: `Auto-created sale record for ${invoice.total}`,
    });

    return updatedInvoice;
  }

  async checkOverdueInvoices() {
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        status: 'SENT',
        dueDate: { lt: new Date() },
      },
    });

    for (const invoice of overdueInvoices) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE' },
      });
    }
  }
}
