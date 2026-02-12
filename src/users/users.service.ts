import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
import { EmailService } from '../auth/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
  ) {}

  async createUser(userId: string, data: {
    email: string;
    role: string;
    password?: string;
    businessId?: string;
  }) {
    const requester = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!requester || requester.role !== 'OWNER') {
      throw new ForbiddenException('Only owners can create users');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    let hashedPassword: string | null = null;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 12);
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role as any,
        businessId: data.businessId || requester.businessId,
        isEmailVerified: true,
      },
    });

    await this.auditService.log({
      userId,
      action: 'USER_CREATED',
      entity: 'User',
      entityId: user.id,
      details: `Created user ${data.email} with role ${data.role}`,
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      createdAt: user.createdAt,
    };
  }

  async getUsers(businessId: string) {
    return this.prisma.user.findMany({
      where: { businessId },
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUser(userId: string, targetUserId: string, data: {
    role?: string;
    password?: string;
  }) {
    const requester = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!requester || requester.role !== 'OWNER') {
      throw new ForbiddenException('Only owners can update users');
    }

    const updateData: any = {};
    if (data.role) {
      updateData.role = data.role as any;
    }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    const user = await this.prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
    });

    await this.auditService.log({
      userId,
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: targetUserId,
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async deleteUser(userId: string, targetUserId: string) {
    const requester = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!requester || requester.role !== 'OWNER') {
      throw new ForbiddenException('Only owners can delete users');
    }

    if (userId === targetUserId) {
      throw new BadRequestException('Cannot delete yourself');
    }

    await this.prisma.user.delete({ where: { id: targetUserId } });

    await this.auditService.log({
      userId,
      action: 'USER_DELETED',
      entity: 'User',
      entityId: targetUserId,
    });

    return { message: 'User deleted successfully' };
  }
}
