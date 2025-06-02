
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
