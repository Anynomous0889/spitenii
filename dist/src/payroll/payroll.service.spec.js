"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const payroll_service_1 = require("./payroll.service");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../security/audit.service");
describe('PayrollService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                payroll_service_1.PayrollService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: {},
                },
                {
                    provide: audit_service_1.AuditService,
                    useValue: {
                        log: jest.fn(),
                    },
                },
            ],
        }).compile();
        service = module.get(payroll_service_1.PayrollService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should calculate payroll correctly', () => {
        const result = service.calculatePayroll(5000);
        expect(result.grossSalary).toBe(5000);
        expect(result.incomeTax).toBe(750);
        expect(result.socialSecurity).toBe(310);
        expect(result.healthInsurance).toBe(250);
        expect(result.totalDeductions).toBe(1310);
        expect(result.deductionPercentage).toBe(26.2);
        expect(result.netSalary).toBe(3690);
    });
});
//# sourceMappingURL=payroll.service.spec.js.map