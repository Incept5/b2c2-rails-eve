
---
type: "task"
task_id: "TASK_06_CreatePaymentSchemeDTOs"
story_id: "STORY_02_PaymentSchemeDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "todo"
---

# Task 6: Create Payment Scheme DTOs

## Task Title
Create comprehensive DTOs for payment scheme request/response handling with validation

## Detailed Description
Implement Data Transfer Objects (DTOs) for payment scheme operations including request validation, response formatting, and specialized DTOs for operational endpoints. The DTOs should provide type safety, validation, and proper serialization for API communication while following established patterns in the codebase.

## Technical Approach / Implementation Plan

1. **Create DTO Files**:
   - Create base DTOs: `backend/src/modules/legal-entity/dto/create-payment-scheme.dto.ts`
   - Create update DTO: `backend/src/modules/legal-entity/dto/update-payment-scheme.dto.ts`
   - Create response DTOs: `backend/src/modules/legal-entity/dto/payment-scheme-response.dto.ts`
   - Create query DTO: `backend/src/modules/legal-entity/dto/query-payment-schemes.dto.ts`

2. **Request DTOs**:
   - CreatePaymentSchemeDto with comprehensive validation
   - UpdatePaymentSchemeDto for partial updates
   - QueryPaymentSchemesDto for filtering and pagination

3. **Response DTOs**:
   - PaymentSchemeResponseDto for single scheme responses
   - PaymentSchemeListResponseDto for paginated lists
   - Specialized response DTOs for operational endpoints

4. **Validation Implementation**:
   - Type-specific validation rules
   - Cross-field validation
   - Custom validators for complex fields
   - Consistent error message formatting

5. **Transformation Logic**:
   - Entity to DTO conversion methods
   - Request to service layer mapping
   - Response formatting and serialization

6. **Swagger Integration**:
   - Comprehensive API documentation
   - Example values for all fields
   - Proper schema definitions

## File Paths to Read
- `backend/src/modules/legal-entity/dto/create-legal-entity.dto.ts` - Reference for DTO patterns
- `backend/src/modules/legal-entity/dto/legal-entity-response.dto.ts` - Response DTO examples
- `backend/src/modules/legal-entity/entities/payment-scheme.entity.ts` - Entity structure

## Relevant Code Snippets

### Create Payment Scheme DTO
```typescript
// create-payment-scheme.dto.ts
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDecimal,
  IsArray,
  ValidateNested,
  IsISO8601,
  IsPositive,
  Length,
  Matches,
  Min,
  Max,
  ArrayMinSize,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentSchemeType } from '../entities/payment-scheme.entity';

export class OperatingHoursDto {
  @ApiProperty({
    description: 'Start time in HH:MM format',
    example: '08:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  start: string;

  @ApiProperty({
    description: 'End time in HH:MM format',
    example: '18:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  end: string;

  @ApiProperty({
    description: 'IANA timezone identifier',
    example: 'Europe/London',
  })
  @IsString()
  @IsNotEmpty()
  timezone: string;
}

export class FeeStructureDto {
  @ApiPropertyOptional({
    description: 'Fixed fee amount',
    example: 0.50,
    minimum: 0,
  })
  @IsOptional()
  @IsPositive()
  flat_fee?: number;

  @ApiPropertyOptional({
    description: 'Percentage fee as decimal (e.g., 0.001 for 0.1%)',
    example: 0.001,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Min(0)
  @Max(1)
  percentage_fee?: number;

  @ApiPropertyOptional({
    description: 'Currency for fees (3-letter ISO code)',
    example: 'EUR',
    pattern: '^[A-Z]{3}$',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a 3-letter ISO code' })
  currency?: string;
}

export class AmountLimitsDto {
  @ApiPropertyOptional({
    description: 'Minimum payment amount',
    example: 0.01,
    minimum: 0,
  })
  @IsOptional()
  @IsPositive()
  min_amount?: number;

  @ApiPropertyOptional({
    description: 'Maximum payment amount',
    example: 1000000,
    minimum: 0,
  })
  @IsOptional()
  @IsPositive()
  max_amount?: number;

  @ApiPropertyOptional({
    description: 'Currency for limits (3-letter ISO code)',
    example: 'EUR',
    pattern: '^[A-Z]{3}$',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a 3-letter ISO code' })
  currency?: string;
}

export class CreatePaymentSchemeDto {
  @ApiProperty({
    description: 'Name of the payment scheme',
    example: 'SEPA Credit Transfer',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @ApiProperty({
    description: 'Type of payment scheme',
    enum: PaymentSchemeType,
    example: PaymentSchemeType.FIAT,
  })
  @IsEnum(PaymentSchemeType, {
    message: 'Type must be one of: fiat, crypto, fx',
  })
  type: PaymentSchemeType;

  @ApiProperty({
    description: 'Primary currency code (ISO 4217)',
    example: 'EUR',
    pattern: '^[A-Z]{3}$',
  })
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a 3-letter ISO code' })
  @Transform(({ value }) => value?.toUpperCase())
  currency: string;

  @ApiPropertyOptional({
    description: 'Target currency for FX schemes (ISO 4217)',
    example: 'USD',
    pattern: '^[A-Z]{3}$',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, { message: 'Target currency must be a 3-letter ISO code' })
  @Transform(({ value }) => value?.toUpperCase())
  target_currency?: string;

  @ApiProperty({
    description: 'Country or region scope for the scheme',
    example: 'EU',
  })
  @IsString()
  @IsNotEmpty()
  country_scope: string;

  @ApiPropertyOptional({
    description: 'Array of available operating days',
    example: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @Transform(({ value }) => value?.map((day: string) => day.toLowerCase()))
  available_days?: string[];

  @ApiPropertyOptional({
    description: 'Operating hours configuration',
    type: OperatingHoursDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  operating_hours?: OperatingHoursDto;

  @ApiPropertyOptional({
    description: 'Holiday calendar with ISO date strings',
    example: ['2025-12-25', '2025-01-01'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsISO8601({ strict: true }, { each: true })
  holiday_calendar?: string[];

  @ApiPropertyOptional({
    description: 'Daily cut-off time (HH:MM format)',
    example: '16:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Cut-off time must be in HH:MM format',
  })
  cut_off_time?: string;

  @ApiPropertyOptional({
    description: 'Settlement time descriptor',
    example: 'T+1',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  settlement_time?: string;

  @ApiPropertyOptional({
    description: 'Fee structure configuration',
    type: FeeStructureDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FeeStructureDto)
  fees?: FeeStructureDto;

  @ApiPropertyOptional({
    description: 'FX spread value (for FX schemes)',
    example: 0.0025,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Min(0)
  @Max(1)
  spread?: number;

  @ApiPropertyOptional({
    description: 'Amount limits configuration',
    type: AmountLimitsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AmountLimitsDto)
  limits?: AmountLimitsDto;

  @ApiPropertyOptional({
    description: 'Whether the scheme supports FX operations',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  supports_fx?: boolean;
}
```

### Update Payment Scheme DTO
```typescript
// update-payment-scheme.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePaymentSchemeDto } from './create-payment-scheme.dto';

export class UpdatePaymentSchemeDto extends PartialType(
  OmitType(CreatePaymentSchemeDto, ['type'] as const)
) {
  // All fields from CreatePaymentSchemeDto are optional except 'type'
  // Type cannot be changed after creation for data integrity
}
```

### Payment Scheme Response DTO
```typescript
// payment-scheme-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentScheme, PaymentSchemeType, OperatingHours, FeeStructure, AmountLimits } from '../entities/payment-scheme.entity';

export class PaymentSchemeResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the payment scheme',
    example: '01HQXK2345ABCDEF67890GHIJK',
  })
  scheme_id: string;

  @ApiProperty({
    description: 'Name of the payment scheme',
    example: 'SEPA Credit Transfer',
  })
  name: string;

  @ApiProperty({
    description: 'Type of payment scheme',
    enum: PaymentSchemeType,
    example: PaymentSchemeType.FIAT,
  })
  type: PaymentSchemeType;

  @ApiProperty({
    description: 'Primary currency code (ISO 4217)',
    example: 'EUR',
  })
  currency: string;

  @ApiPropertyOptional({
    description: 'Target currency for FX schemes (ISO 4217)',
    example: 'USD',
  })
  target_currency?: string;

  @ApiProperty({
    description: 'Country or region scope for the scheme',
    example: 'EU',
  })
  country_scope: string;

  @ApiProperty({
    description: 'Array of available operating days',
    example: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    type: [String],
  })
  available_days: string[];

  @ApiProperty({
    description: 'Operating hours configuration',
    example: { start: '08:00', end: '18:00', timezone: 'Europe/London' },
  })
  operating_hours: OperatingHours;

  @ApiProperty({
    description: 'Holiday calendar with ISO date strings',
    example: ['2025-12-25', '2025-01-01'],
    type: [String],
  })
  holiday_calendar: string[];

  @ApiPropertyOptional({
    description: 'Daily cut-off time (HH:MM format)',
    example: '16:00',
  })
  cut_off_time?: string;

  @ApiProperty({
    description: 'Settlement time descriptor',
    example: 'T+1',
  })
  settlement_time: string;

  @ApiProperty({
    description: 'Fee structure configuration',
    example: { flat_fee: 0.50, percentage_fee: 0.001, currency: 'EUR' },
  })
  fees: FeeStructure;

  @ApiPropertyOptional({
    description: 'FX spread value (for FX schemes)',
    example: 0.0025,
  })
  spread?: number;

  @ApiProperty({
    description: 'Amount limits configuration',
    example: { min_amount: 0.01, max_amount: 1000000, currency: 'EUR' },
  })
  limits: AmountLimits;

  @ApiProperty({
    description: 'Whether the scheme supports FX operations',
    example: true,
  })
  supports_fx: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-02-06T12:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-02-06T12:00:00Z',
  })
  updated_at: Date;

  static fromEntity(entity: PaymentScheme): PaymentSchemeResponseDto {
    const dto = new PaymentSchemeResponseDto();
    dto.scheme_id = entity.scheme_id;
    dto.name = entity.name;
    dto.type = entity.type;
    dto.currency = entity.currency;
    dto.target_currency = entity.target_currency;
    dto.country_scope = entity.country_scope;
    dto.available_days = entity.available_days;
    dto.operating_hours = entity.operating_hours;
    dto.holiday_calendar = entity.holiday_calendar;
    dto.cut_off_time = entity.cut_off_time;
    dto.settlement_time = entity.settlement_time;
    dto.fees = entity.fees;
    dto.spread = entity.spread;
    dto.limits = entity.limits;
    dto.supports_fx = entity.supports_fx;
    dto.created_at = entity.created_at;
    dto.updated_at = entity.updated_at;
    return dto;
  }
}

export class PaymentSchemeListResponseDto {
  @ApiProperty({
    description: 'Array of payment schemes',
    type: [PaymentSchemeResponseDto],
  })
  data: PaymentSchemeResponseDto[];

  @ApiProperty({
    description: 'Total number of payment schemes matching filters',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  total_pages: number;

  static fromPaginatedResult(result: any): PaymentSchemeListResponseDto {
    const dto = new PaymentSchemeListResponseDto();
    dto.data = result.data.map((entity: PaymentScheme) => PaymentSchemeResponseDto.fromEntity(entity));
    dto.total = result.total;
    dto.page = result.page;
    dto.limit = result.limit;
    dto.total_pages = result.total_pages;
    return dto;
  }
}

// Specialized response DTOs for operational endpoints
export class SchemeAvailabilityResponseDto {
  @ApiProperty({
    description: 'Payment scheme identifier',
    example: '01HQXK2345ABCDEF67890GHIJK',
  })
  scheme_id: string;

  @ApiProperty({
    description: 'Whether the scheme is currently operational',
    example: true,
  })
  is_operational: boolean;

  @ApiPropertyOptional({
    description: 'Next availability time if currently not operational',
    example: '2025-02-07T08:00:00Z',
  })
  next_availability?: Date;

  @ApiPropertyOptional({
    description: 'Array of current restrictions',
    example: ['Outside operating hours', 'Holiday calendar restriction'],
    type: [String],
  })
  restrictions?: string[];

  static fromResult(result: any): SchemeAvailabilityResponseDto {
    const dto = new SchemeAvailabilityResponseDto();
    dto.scheme_id = result.scheme_id;
    dto.is_operational = result.is_operational;
    dto.next_availability = result.next_availability;
    dto.restrictions = result.restrictions;
    return dto;
  }
}

export class FeeCalculationResponseDto {
  @ApiProperty({
    description: 'Original payment amount',
    example: 1000.00,
  })
  base_amount: number;

  @ApiProperty({
    description: 'Total calculated fees',
    example: 1.50,
  })
  total_fee: number;

  @ApiProperty({
    description: 'Breakdown of fee components',
    example: {
      flat_fee: 0.50,
      percentage_fee: 1.00,
      fx_spread_fee: 0.00,
    },
  })
  fee_breakdown: {
    flat_fee?: number;
    percentage_fee?: number;
    fx_spread_fee?: number;
  };

  @ApiProperty({
    description: 'Final amount including fees',
    example: 1001.50,
  })
  final_amount: number;

  static fromResult(result: any): FeeCalculationResponseDto {
    const dto = new FeeCalculationResponseDto();
    dto.base_amount = result.base_amount;
    dto.total_fee = result.total_fee;
    dto.fee_breakdown = result.fee_breakdown;
    dto.final_amount = result.final_amount;
    return dto;
  }
}

export class SchemeCompatibilityResponseDto {
  @ApiProperty({
    description: 'Payment scheme identifier',
    example: '01HQXK2345ABCDEF67890GHIJK',
  })
  scheme_id: string;

  @ApiProperty({
    description: 'Whether the scheme is compatible with the requirements',
    example: true,
  })
  is_compatible: boolean;

  @ApiProperty({
    description: 'Source currency',
    example: 'EUR',
  })
  source_currency: string;

  @ApiProperty({
    description: 'Target currency',
    example: 'USD',
  })
  target_currency: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 1000.00,
  })
  amount: number;

  @ApiPropertyOptional({
    description: 'Reasons for incompatibility',
    example: ['Currency not supported', 'Amount exceeds limits'],
    type: [String],
  })
  incompatibility_reasons?: string[];

  static fromResult(result: any): SchemeCompatibilityResponseDto {
    const dto = new SchemeCompatibilityResponseDto();
    dto.scheme_id = result.scheme_id;
    dto.is_compatible = result.is_compatible;
    dto.source_currency = result.source_currency;
    dto.target_currency = result.target_currency;
    dto.amount = result.amount;
    dto.incompatibility_reasons = result.incompatibility_reasons;
    return dto;
  }
}
```

### Query Payment Schemes DTO
```typescript
// query-payment-schemes.dto.ts
import { IsOptional, IsEnum, IsString, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentSchemeType } from '../entities/payment-scheme.entity';

export class QueryPaymentSchemesDto {
  @ApiPropertyOptional({
    description: 'Page number (minimum: 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (minimum: 1, maximum: 100)',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by payment scheme type',
    enum: PaymentSchemeType,
  })
  @IsOptional()
  @IsEnum(PaymentSchemeType)
  type?: PaymentSchemeType;

  @ApiPropertyOptional({
    description: 'Filter by currency (3-letter ISO code)',
    example: 'EUR',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  currency?: string;

  @ApiPropertyOptional({
    description: 'Filter by country or region scope',
    example: 'EU',
  })
  @IsOptional()
  @IsString()
  country_scope?: string;

  @ApiPropertyOptional({
    description: 'Filter by FX support capability',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  supports_fx?: boolean;

  @ApiPropertyOptional({
    description: 'Return only currently operational schemes',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  operational_only?: boolean;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'created_at',
    enum: ['name', 'type', 'currency', 'created_at', 'updated_at'],
  })
  @IsOptional()
  @IsString()
  sort_by?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort_order?: 'asc' | 'desc' = 'desc';
}
```

## API Endpoint Details
N/A - DTOs are used by controllers and services.

## Database Schema Changes
N/A - DTOs handle request/response transformation.

## Libraries/Dependencies
- class-validator (already available)
- class-transformer (already available)
- @nestjs/swagger (already available)

## Potential Challenges and Solutions

1. **Complex Nested Validation**:
   - Challenge: Validating nested objects like operating_hours and fees
   - Solution: Use nested DTOs with @ValidateNested and proper type transformations

2. **Type-Specific Validation**:
   - Challenge: Different validation rules based on payment scheme type
   - Solution: Implement custom validators or handle in service layer validation

3. **Transformation Consistency**:
   - Challenge: Ensuring consistent data transformation between request/response
   - Solution: Use class-transformer decorators and standardized transformation methods

4. **API Documentation Accuracy**:
   - Challenge: Keeping Swagger documentation in sync with actual validation
   - Solution: Use decorators extensively and provide comprehensive examples

## Test Cases to Consider

1. **Validation Testing**:
   - Valid DTOs pass validation
   - Invalid field values are rejected
   - Required fields are enforced
   - Optional fields work correctly

2. **Transformation Testing**:
   - Entity to response DTO conversion
   - Request DTO to service layer mapping
   - Nested object transformations
   - Default value handling

3. **Swagger Documentation**:
   - All DTOs generate correct OpenAPI schemas
   - Examples are accurate and helpful
   - Validation rules are properly documented
   - Response schemas match actual responses

4. **Edge Cases**:
   - Empty or null values handling
   - Invalid enum values
   - Boundary value testing
   - Malformed JSON structures

5. **Performance**:
   - Large payload validation performance
   - Transformation efficiency
   - Memory usage with complex nested objects
   - Validation error message clarity
