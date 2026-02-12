import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(data: {
        userId?: string;
        action: string;
        entity: string;
        entityId?: string;
        ipAddress?: string;
        userAgent?: string;
        details?: string;
    }): Promise<void>;
}
