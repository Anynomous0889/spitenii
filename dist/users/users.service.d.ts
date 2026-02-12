import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
import { EmailService } from '../auth/email.service';
export declare class UsersService {
    private readonly prisma;
    private readonly auditService;
    private readonly emailService;
    constructor(prisma: PrismaService, auditService: AuditService, emailService: EmailService);
    createUser(userId: string, data: {
        email: string;
        role: string;
        password?: string;
        businessId?: string;
    }): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        businessId: string;
        createdAt: Date;
    }>;
    getUsers(businessId: string): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        lastLoginAt: Date;
        createdAt: Date;
    }[]>;
    updateUser(userId: string, targetUserId: string, data: {
        role?: string;
        password?: string;
    }): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    deleteUser(userId: string, targetUserId: string): Promise<{
        message: string;
    }>;
}
