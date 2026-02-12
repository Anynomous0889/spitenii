import { IsString, IsArray, ValidateNested, IsDateString, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsUUID(4, { message: 'Invalid product ID format' })
  productId: string;

  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

export class CreateInvoiceDto {
  @IsUUID(4, { message: 'Invalid customer ID format' })
  customerId: string;

  @IsDateString({}, { message: 'Invalid due date format' })
  dueDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
