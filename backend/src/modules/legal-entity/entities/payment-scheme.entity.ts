import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDecimal,
  ValidateNested,
  IsISO8601,
  IsPositive,
  Length,
  Matches,
  Min,
  Max,
  IsArray,
  IsDateString,
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

/**
 * Payment Scheme Entity
 * Represents a payment scheme configuration in the system
 * 
 * Payment schemes define the baseline rules, characteristics, and operational
 * constraints for different payment networks (SEPA, SWIFT, crypto networks, FX venues)
 */
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
  @IsArray()
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
  @IsArray()
  @IsDateString({}, { each: true })
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
    // Get day name in lowercase
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
    
    // For crypto schemes, assume 24/7 operation unless explicitly restricted
    if (this.type === PaymentSchemeType.CRYPTO) {
      return true;
    }
    
    // Check operating hours (simplified - would need proper timezone handling in production)
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
      if (this.spread === undefined || this.spread === null) {
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
    
    // Validate available days
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of this.available_days) {
      if (!validDays.includes(day.toLowerCase())) {
        errors.push(`Invalid day in available_days: ${day}`);
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

  /**
   * Get scheme capabilities based on type
   */
  getCapabilities(): {
    supports_instant_settlement: boolean;
    supports_scheduled_payments: boolean;
    supports_high_value: boolean;
    supports_cross_border: boolean;
  } {
    switch (this.type) {
      case PaymentSchemeType.CRYPTO:
        return {
          supports_instant_settlement: true,
          supports_scheduled_payments: false,
          supports_high_value: true,
          supports_cross_border: true,
        };
      case PaymentSchemeType.FX:
        return {
          supports_instant_settlement: true,
          supports_scheduled_payments: false,
          supports_high_value: true,
          supports_cross_border: true,
        };
      case PaymentSchemeType.FIAT:
        return {
          supports_instant_settlement: this.settlement_time === 'instant',
          supports_scheduled_payments: true,
          supports_high_value: true,
          supports_cross_border: this.country_scope !== 'domestic',
        };
      default:
        return {
          supports_instant_settlement: false,
          supports_scheduled_payments: false,
          supports_high_value: false,
          supports_cross_border: false,
        };
    }
  }

  /**
   * Get default configuration for a scheme type
   */
  static getDefaultConfiguration(type: PaymentSchemeType): Partial<PaymentScheme> {
    switch (type) {
      case PaymentSchemeType.CRYPTO:
        return {
          available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          operating_hours: { start: '00:00', end: '23:59', timezone: 'UTC' },
          holiday_calendar: [],
          settlement_time: 'instant',
          supports_fx: true,
          fees: { flat_fee: 0, percentage_fee: 0.001 },
        };
      case PaymentSchemeType.FX:
        return {
          available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          operating_hours: { start: '08:00', end: '17:00', timezone: 'UTC' },
          holiday_calendar: [],
          settlement_time: 'instant',
          supports_fx: true,
          fees: { flat_fee: 0, percentage_fee: 0 },
        };
      case PaymentSchemeType.FIAT:
        return {
          available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          operating_hours: { start: '08:00', end: '17:00', timezone: 'UTC' },
          holiday_calendar: [],
          settlement_time: 'T+1',
          supports_fx: false,
          fees: { flat_fee: 0.50, percentage_fee: 0 },
        };
      default:
        return {};
    }
  }
}
