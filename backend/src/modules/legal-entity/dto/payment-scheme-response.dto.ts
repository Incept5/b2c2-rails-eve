
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
