import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles('OWNER')
  async createUser(@Req() req: any, @Body() body: any) {
    return this.usersService.createUser(req.user.userId, body);
  }

  @Get()
  @Roles('OWNER', 'MANAGER')
  async getUsers(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    return this.usersService.getUsers(user!.businessId!);
  }

  @Put(':id')
  @Roles('OWNER')
  async updateUser(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.usersService.updateUser(req.user.userId, id, body);
  }

  @Delete(':id')
  @Roles('OWNER')
  async deleteUser(@Req() req: any, @Param('id') id: string) {
    return this.usersService.deleteUser(req.user.userId, id);
  }
}
