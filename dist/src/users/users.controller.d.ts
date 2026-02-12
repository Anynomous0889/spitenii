import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersController {
    private readonly usersService;
    private readonly prisma;
    constructor(usersService: UsersService, prisma: PrismaService);
    createUser(req: any, body: any): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        businessId: string;
        createdAt: Date;
    }>;
    getUsers(req: any): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        lastLoginAt: Date;
        createdAt: Date;
    }[]>;
    updateUser(req: any, id: string, body: any): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    deleteUser(req: any, id: string): Promise<{
        message: string;
    }>;
}
