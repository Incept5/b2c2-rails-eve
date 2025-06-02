
---
type: "task"
task_id: "TASK_02_CreatePaymentSchemeEntity"
story_id: "STORY_02_PaymentSchemeDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "completed"
---

# Task 2: Create Payment Scheme Entity

## Task Title
Create PaymentScheme entity class with proper TypeScript typing and validation

## Detailed Description
Implement the PaymentScheme entity class that represents the payment_schemes database table. The entity should include proper TypeScript types, validation decorators, and methods for handling complex JSON configuration fields.

## Technical Approach / Implementation Plan

1. **Create Entity File**:
   - Create `backend/src/modules/legal-entity/entities/payment-scheme.entity.ts`
   - Follow existing entity patterns in the codebase

2. **TypeScript Interface Design**:
   - Define proper types for all entity fields
   - Create type unions for enum values
   - Define interfaces for JSON field structures

3. **Validation Decorators**:
   - Add class-validator decorators for field validation
   - Implement custom validators for complex fields
   - Add transformation decorators for data formatting

4. **Business Logic Methods**:
   - Methods for checking operational availability
   - Methods for calculating fees and spreads
   - Methods for validating configuration consistency

5. **JSON Field Handling**:
   - Type-safe interfaces for JSON configurations
   - Validation methods for nested JSON structures
   - Default value handling for optional configurations

## File Paths to Read
- `backend/src/modules/legal-entity/entities/legal-entity.entity.ts` - Reference for entity patterns
- `backend/src/modules/auth/entities/user.entity.ts` - Additional entity examples
- `backend/src/modules/legal-entity/dto/create-legal-entity.dto.ts` - Validation patterns

## Relevant Code Snippets

### Entity Implementation
```typescript
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDecimal,
  IsJSON,
  ValidateNested,
  IsISO8601,
  IsPositive,
  Length,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Type definitions for JSON fields
export interface OperatingHours {
  start: string; // HH:MM format
  end: string;   // HH:MM format
  timezone: string; // IANA timezone
}

export interface FeeStructure {
  flat_fee?: number;
  percentage_fee?: number;
  currency?: string;
}

export interface AmountLimits {
  min_amount?: number;
  max_amount?: number;
  currency?: string;
}

export enum PaymentSchemeType {
  FIAT = 'fiat',
  CRYPTO = 'crypto',
  FX = 'fx',
}

export class PaymentScheme {
  @ApiProperty({
    description: 'Unique identifier for the payment scheme',
    example: '01HQXK2345ABCDEF67890GHIJK',
  })
  @IsString()
  @IsNotEmpty()
  scheme_id: string;

  @ApiProperty({
    description: 'Name of the payment scheme',
    example: 'SEPA Credit Transfer',
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
  @IsEnum(PaymentSchemeType)
  type: PaymentSchemeType;

  @ApiProperty({
    description: 'Primary currency code (ISO 4217)',
    example: 'EUR',
    pattern: '^[A-Z]{3}$',
  })
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a 3-letter ISO code' })
  currency: string;

  @ApiProperty({
    description: 'Target currency for FX schemes (ISO 4217)',
    example: 'USD',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, { message: 'Target currency must be a 3-letter ISO code' })
  target_currency?: string;

  @ApiProperty({
    description: 'Country or region scope for the scheme',
    example: 'EU',
  })
  @IsString()
  @IsNotEmpty()
  country_scope: string;

  @ApiProperty({
    description: 'Array of available operating days',
    example: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    type: [String],
  })
  @IsString({ each: true })
  available_days: string[];

  @ApiProperty({
    description: 'Operating hours configuration',
    example: { start: '08:00', end: '18:00', timezone: 'Europe/London' },
  })
  @ValidateNested()
  @Type(() => Object)
  operating_hours: OperatingHours;

  @ApiProperty({
    description: 'Holiday calendar with ISO date strings',
    example: ['2025-12-25', '2025-01-01'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsISO8601({}, { each: true })
  holiday_calendar: string[];

  @ApiProperty({
    description: 'Daily cut-off time (HH:MM format)',
    example: '16:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Cut-off time must be in HH:MM format' })
  cut_off_time?: string;

  @ApiProperty({
    description: 'Settlement time descriptor',
    example: 'T+1',
  })
  @IsString()
  @IsNotEmpty()
  settlement_time: string;

  @ApiProperty({
    description: 'Fee structure configuration',
    example: { flat_fee: 0.50, percentage_fee: 0.001, currency: 'EUR' },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  fees: FeeStructure;

  @ApiProperty({
    description: 'FX spread value (for FX schemes)',
    example: 0.0025,
    required: false,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,6' })
  @Min(0)
  @Max(1)
  spread?: number;

  @ApiProperty({
    description: 'Amount limits configuration',
    example: { min_amount: 0.01, max_amount: 1000000, currency: 'EUR' },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  limits: AmountLimits;

  @ApiProperty({
    description: 'Whether the scheme supports FX operations',
    example: true,
  })
  @IsBoolean()
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

  // Business logic methods
  
  /**
   * Check if the scheme is currently operational based on time and calendar
   */
  isOperational(currentTime: Date = new Date()): boolean {
    // Implementation for checking operational status
    const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Check if current day is in available_days
    if (!this.available_days.includes(dayName)) {
      return false;
    }
    
    // Check holiday calendar
    const currentDate = currentTime.toISOString().split('T')[0];
    if (this.holiday_calendar?.includes(currentDate)) {
      return false;
    }
    
    // For crypto schemes, assume 24/7 operation
    if (this.type === PaymentSchemeType.CRYPTO) {
      return true;
    }
    
    // Check operating hours (simplified - would need proper timezone handling)
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = this.operating_hours.start.split(':').map(Number);
    const [endHour, endMinute] = this.operating_hours.end.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    
    return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
  }

  /**
   * Calculate total fee for a given amount
   */
  calculateFee(amount: number): number {
    if (!this.fees) {
      return 0;
    }
    
    let totalFee = 0;
    
    if (this.fees.flat_fee) {
      totalFee += this.fees.flat_fee;
    }
    
    if (this.fees.percentage_fee) {
      totalFee += amount * this.fees.percentage_fee;
    }
    
    return totalFee;
  }

  /**
   * Validate scheme configuration consistency
   */
  validateConfiguration(): string[] {
    const errors: string[] = [];
    
    // FX-specific validations
    if (this.type === PaymentSchemeType.FX) {
      if (!this.target_currency) {
        errors.push('FX schemes must have a target_currency');
      }
      if (!this.spread) {
        errors.push('FX schemes must have a spread value');
      }
    }
    
    // Crypto-specific validations
    if (this.type === PaymentSchemeType.CRYPTO) {
      if (!this.available_days.includes('saturday') || !this.available_days.includes('sunday')) {
        errors.push('Crypto schemes should operate 24/7 including weekends');
      }
    }
    
    // Operating hours validation
    if (this.operating_hours) {
      const [startHour] = this.operating_hours.start.split(':').map(Number);
      const [endHour] = this.operating_hours.end.split(':').map(Number);
      
      if (startHour >= endHour) {
        errors.push('Operating hours start time must be before end time');
      }
    }
    
    return errors;
  }

  /**
   * Check if amount is within scheme limits
   */
  isAmountWithinLimits(amount: number): boolean {
    if (!this.limits) {
      return true;
    }
    
    if (this.limits.min_amount && amount < this.limits.min_amount) {
      return false;
    }
    
    if (this.limits.max_amount && amount > this.limits.max_amount) {
      return false;
    }
    
    return true;
  }
}
```

## API Endpoint Details
N/A - This is an entity definition task.

## Database Schema Changes
N/A - Entity maps to existing payment_schemes table.

## Libraries/Dependencies
- class-validator (already available)
- class-transformer (already available)
- @nestjs/swagger (already available)

## Potential Challenges and Solutions

1. **JSON Field Typing**:
   - Challenge: TypeScript typing for dynamic JSON fields
   - Solution: Define specific interfaces for each JSON field type

2. **Validation Complexity**:
   - Challenge: Cross-field validation (e.g., FX schemes require spread)
   - Solution: Implement custom validation methods and use in service layer

3. **Time Zone Handling**:
   - Challenge: Operating hours across different time zones
   - Solution: Store timezone info and use proper date libraries for calculations

4. **Enum Consistency**:
   - Challenge: Keeping TypeScript enums in sync with database constraints
   - Solution: Use string literals and export for reuse in DTOs and services

## Test Cases to Consider

1. **Entity Validation**:
   - Valid PaymentScheme instances pass validation
   - Invalid currency codes are rejected
   - Required fields trigger validation errors
   - JSON field validation works correctly

2. **Business Logic Methods**:
   - isOperational() correctly identifies operational times
   - calculateFee() handles different fee structures
   - validateConfiguration() catches scheme inconsistencies
   - isAmountWithinLimits() respects configured limits

3. **Type Safety**:
   - JSON fields maintain type safety
   - Enum values are properly constrained
   - Optional fields handle null/undefined correctly

4. **Edge Cases**:
   - Empty or malformed JSON configurations
   - Boundary values for amounts and times
   - Cross-timezone operational hour calculations
   - Holiday calendar edge cases
