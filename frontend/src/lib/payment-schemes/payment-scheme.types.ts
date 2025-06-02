
// Payment Scheme Types - Matching backend DTOs exactly

export enum PaymentSchemeType {
  FIAT = 'fiat',
  CRYPTO = 'crypto',
  FX = 'fx',
}

export interface OperatingHours {
  start: string; // HH:MM format
  end: string; // HH:MM format
  timezone: string; // IANA timezone identifier
}

export interface FeeStructure {
  flat_fee?: number;
  percentage_fee?: number; // Decimal (e.g., 0.001 for 0.1%)
  currency?: string; // 3-letter ISO code
}

export interface AmountLimits {
  min_amount?: number;
  max_amount?: number;
  currency?: string; // 3-letter ISO code
}

export interface PaymentScheme {
  scheme_id: string;
  name: string;
  type: PaymentSchemeType;
  currency: string; // 3-letter ISO code
  target_currency?: string; // For FX schemes
  country_scope: string;
  available_days: string[];
  operating_hours: OperatingHours;
  holiday_calendar: string[]; // ISO date strings
  cut_off_time?: string; // HH:MM format
  settlement_time: string; // e.g., "T+1", "instant"
  fees: FeeStructure;
  spread?: number; // For FX schemes
  limits: AmountLimits;
  supports_fx: boolean;
  created_at: Date;
  updated_at: Date;
}

// DTOs for API requests
export interface CreatePaymentSchemeDto {
  name: string;
  type: PaymentSchemeType;
  currency: string;
  target_currency?: string;
  country_scope: string;
  available_days?: string[];
  operating_hours?: {
    start: string;
    end: string;
    timezone: string;
  };
  holiday_calendar?: string[];
  cut_off_time?: string;
  settlement_time?: string;
  fees?: {
    flat_fee?: number;
    percentage_fee?: number;
    currency?: string;
  };
  spread?: number;
  limits?: {
    min_amount?: number;
    max_amount?: number;
    currency?: string;
  };
  supports_fx?: boolean;
}

export interface UpdatePaymentSchemeDto {
  name?: string;
  currency?: string;
  target_currency?: string;
  country_scope?: string;
  available_days?: string[];
  operating_hours?: {
    start: string;
    end: string;
    timezone: string;
  };
  holiday_calendar?: string[];
  cut_off_time?: string;
  settlement_time?: string;
  fees?: {
    flat_fee?: number;
    percentage_fee?: number;
    currency?: string;
  };
  spread?: number;
  limits?: {
    min_amount?: number;
    max_amount?: number;
    currency?: string;
  };
  supports_fx?: boolean;
}

// Filter and pagination types
export interface PaymentSchemeFilters {
  page?: number;
  limit?: number;
  type?: PaymentSchemeType;
  currency?: string;
  country_scope?: string;
  supports_fx?: boolean;
  operational_only?: boolean;
}

export interface PaginatedPaymentSchemesResponse {
  data: PaymentScheme[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Specialized response types for operational endpoints
export interface SchemeAvailability {
  scheme_id: string;
  is_operational: boolean;
  next_availability?: Date;
  restrictions?: string[];
}

export interface FeeCalculation {
  base_amount: number;
  total_fee: number;
  fee_breakdown: {
    flat_fee?: number;
    percentage_fee?: number;
    fx_spread_fee?: number;
  };
  final_amount: number;
}

export interface SchemeCompatibility {
  scheme_id: string;
  is_compatible: boolean;
  source_currency: string;
  target_currency: string;
  amount: number;
  incompatibility_reasons?: string[];
}

// Error handling
export interface ApiError {
  message: string;
  statusCode: number;
}

// Utility types for forms and UI
export interface SchemeFormData extends CreatePaymentSchemeDto {
  // Additional UI-specific fields if needed
}

export interface SchemeFilterState {
  searchTerm: string;
  filters: PaymentSchemeFilters;
}

// Constants for form validation and UI
export const WEEKDAYS = [
  'monday',
  'tuesday', 
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const;

export const SETTLEMENT_TIMES = [
  'instant',
  'T+0',
  'T+1',
  'T+2',
  'T+3'
] as const;

export const COMMON_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CHF',
  'CAD',
  'AUD',
  'BTC',
  'ETH'
] as const;

export const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'Europe/London',
  'Europe/Frankfurt',
  'Asia/Tokyo',
  'Asia/Hong_Kong',
  'Asia/Singapore'
] as const;
