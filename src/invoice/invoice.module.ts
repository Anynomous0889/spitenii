import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PdfService } from './pdf.service';
import { SecurityModule } from '../security/security.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SecurityModule, AuthModule],
  providers: [InvoiceService, PdfService],
  controllers: [InvoiceController],
  exports: [InvoiceService, PdfService],
})
export class InvoiceModule {}
