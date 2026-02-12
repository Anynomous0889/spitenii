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
exports.ProcessPayrollDto = exports.CalculatePayrollDto = void 0;
const class_validator_1 = require("class-validator");
class CalculatePayrollDto {
}
exports.CalculatePayrollDto = CalculatePayrollDto;
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0, { message: 'Gross salary must be greater than or equal to 0' }),
    __metadata("design:type", Number)
], CalculatePayrollDto.prototype, "grossSalary", void 0);
class ProcessPayrollDto {
}
exports.ProcessPayrollDto = ProcessPayrollDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(4, { message: 'Invalid employee ID format' }),
    __metadata("design:type", String)
], ProcessPayrollDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}$/, { message: 'Month must be in YYYY-MM format' }),
    __metadata("design:type", String)
], ProcessPayrollDto.prototype, "month", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2000),
    (0, class_validator_1.Max)(2100),
    __metadata("design:type", Number)
], ProcessPayrollDto.prototype, "year", void 0);
//# sourceMappingURL=calculate-payroll.dto.js.map