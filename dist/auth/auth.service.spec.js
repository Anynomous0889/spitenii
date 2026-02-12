"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("./auth.service");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const encryption_service_1 = require("../security/encryption.service");
const audit_service_1 = require("../security/audit.service");
const email_service_1 = require("./email.service");
describe('AuthService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: {
                        user: {
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                        },
                        business: {
                            create: jest.fn(),
                        },
                    },
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: {
                        sign: jest.fn(),
                        verify: jest.fn(),
                    },
                },
                {
                    provide: encryption_service_1.EncryptionService,
                    useValue: {},
                },
                {
                    provide: audit_service_1.AuditService,
                    useValue: {
                        log: jest.fn(),
                    },
                },
                {
                    provide: email_service_1.EmailService,
                    useValue: {
                        sendVerificationEmail: jest.fn(),
                        sendPasswordResetEmail: jest.fn(),
                    },
                },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=auth.service.spec.js.map