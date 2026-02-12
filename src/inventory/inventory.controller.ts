import { Controller, Get, Post, Put, Body, Param, UseGuards, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { IsNumber, IsString, MaxLength } from 'class-validator';

class AdjustStockDto {
  @IsNumber()
  adjustment: number;

  @IsString()
  @MaxLength(500)
  reason: string;
}

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('products')
  @Roles('OWNER', 'MANAGER')
  async createProduct(@Req() req: any, @Body() body: CreateProductDto) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.inventoryService.createProduct(user.businessId, req.user.userId, body);
  }

  @Get('products')
  async getProducts(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.inventoryService.getProducts(user.businessId);
  }

  @Get('products/:id')
  async getProduct(@Req() req: any, @Param('id') id: string) {
    if (!id || typeof id !== 'string' || id.length > 100) {
      throw new BadRequestException('Invalid product ID');
    }
    const product = await this.inventoryService.getProduct(id);
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    // Verify user has access to this product's business
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (product.businessId !== user?.businessId) {
      throw new ForbiddenException('Access denied');
    }
    return product;
  }

  @Put('products/:id')
  @Roles('OWNER', 'MANAGER')
  async updateProduct(@Req() req: any, @Param('id') id: string, @Body() body: Partial<CreateProductDto>) {
    if (!id || typeof id !== 'string' || id.length > 100) {
      throw new BadRequestException('Invalid product ID');
    }
    // Verify ownership before updating
    const product = await this.inventoryService.getProduct(id);
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (product?.businessId !== user?.businessId) {
      throw new ForbiddenException('Access denied');
    }
    return this.inventoryService.updateProduct(id, req.user.userId, body);
  }

  @Get('low-stock')
  async getLowStock(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    return this.inventoryService.getLowStockProducts(user.businessId);
  }

  @Post('products/:id/adjust-stock')
  @Roles('OWNER', 'MANAGER')
  async adjustStock(@Req() req: any, @Param('id') id: string, @Body() body: AdjustStockDto) {
    if (!id || typeof id !== 'string' || id.length > 100) {
      throw new BadRequestException('Invalid product ID');
    }
    // Verify ownership before adjusting
    const product = await this.inventoryService.getProduct(id);
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (product?.businessId !== user?.businessId) {
      throw new ForbiddenException('Access denied');
    }
    return this.inventoryService.adjustStock(id, req.user.userId, body.adjustment, body.reason);
  }

  @Get('value')
  async getInventoryValue(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user?.businessId) {
      throw new ForbiddenException('User not associated with a business');
    }
    const value = await this.inventoryService.getInventoryValue(user.businessId);
    return { value };
  }
}
