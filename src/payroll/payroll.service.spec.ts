import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';

describe('PayrollService', () => {
  let service: PayrollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
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
