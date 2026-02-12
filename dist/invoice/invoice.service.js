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
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../security/audit.service");
const pdf_service_1 = require("./pdf.service");
const email_service_1 = require("../auth/email.service");
let InvoiceService = class InvoiceService {
    constructor(prisma, auditService, pdfService, emailService) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.pdfService = pdfService;
        this.emailService = emailService;
    }
    async createInvoice(userId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.businessId) {
            throw new common_1.BadRequestException('User not associated with a business');
        }
        const business = await this.prisma.business.findUnique({ where: { id: user.businessId } });
        const invoiceCount = await this.prisma.invoice.count({ where: { businessId: user.businessId } });
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;
        let subtotal = 0;
        const items = [];
        for (const item of data.items) {
            const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) {
                throw new common_1.BadRequestException(`Product ${item.productId} not found`);
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
    async getInvoices(businessId, filters) {
        return this.prisma.invoice.findMany({
            where: { businessId, ...filters },
            include: {
                customer: true,
                items: { include: { product: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getInvoice(id) {
        return this.prisma.invoice.findUnique({
            where: { id },
            include: {
                customer: true,
                items: { include: { product: true } },
                business: true,
            },
        });
    }
    async sendInvoice(userId, invoiceId) {
        const invoice = await this.getInvoice(invoiceId);
        if (!invoice) {
            throw new common_1.BadRequestException('Invoice not found');
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
    async markAsPaid(userId, invoiceId) {
        const invoice = await this.getInvoice(invoiceId);
        if (!invoice) {
            throw new common_1.BadRequestException('Invoice not found');
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
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        pdf_service_1.PdfService,
        email_service_1.EmailService])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map