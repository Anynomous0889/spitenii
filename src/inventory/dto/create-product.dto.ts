import { IsString, IsNumber, IsInt, Min, MaxLength, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2, { message: 'Product name must be at least 2 characters' })
  @MaxLength(255, { message: 'Product name must not exceed 255 characters' })
  name: string;

  @IsString()
  @MinLength(1, { message: 'SKU is required' })
  @MaxLength(100, { message: 'SKU must not exceed 100 characters' })
  sku: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price: number;

  @IsInt()
  @Min(0, { message: 'Stock quantity must be greater than or equal to 0' })
  stockQuantity: number;

  @IsInt()
  @Min(0, { message: 'Low stock alert must be greater than or equal to 0' })
  lowStockAlert: number;
}
