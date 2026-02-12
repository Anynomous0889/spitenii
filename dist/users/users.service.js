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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../security/audit.service");
const email_service_1 = require("../auth/email.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma, auditService, emailService) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.emailService = emailService;
    }
    async createUser(userId, data) {
        const requester = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!requester || requester.role !== 'OWNER') {
            throw new common_1.ForbiddenException('Only owners can create users');
        }
        const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        let hashedPassword = null;
        if (data.password) {
            hashedPassword = await bcrypt.hash(data.password, 12);
        }
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: data.role,
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
    async getUsers(businessId) {
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
    async updateUser(userId, targetUserId, data) {
        const requester = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!requester || requester.role !== 'OWNER') {
            throw new common_1.ForbiddenException('Only owners can update users');
        }
        const updateData = {};
        if (data.role) {
            updateData.role = data.role;
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
    async deleteUser(userId, targetUserId) {
        const requester = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!requester || requester.role !== 'OWNER') {
            throw new common_1.ForbiddenException('Only owners can delete users');
        }
        if (userId === targetUserId) {
            throw new common_1.BadRequestException('Cannot delete yourself');
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        email_service_1.EmailService])
], UsersService);
//# sourceMappingURL=users.service.js.map