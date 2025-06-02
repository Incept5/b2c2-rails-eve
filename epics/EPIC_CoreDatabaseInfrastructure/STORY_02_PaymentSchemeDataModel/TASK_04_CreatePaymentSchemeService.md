
---
type: "task"
task_id: "TASK_04_CreatePaymentSchemeService"
story_id: "STORY_02_PaymentSchemeDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "todo"
---

# Task 4: Create Payment Scheme Service

## Task Title
Create PaymentSchemeService with comprehensive business logic, validation, and operational methods

## Detailed Description
Implement the service layer for payment schemes that handles business logic, validation, configuration management, and operational availability checks. The service should orchestrate between repository and external systems while enforcing business rules and providing high-level operations for the API layer.

## Technical Approach / Implementation Plan

1. **Create Service File**:
   - Create `backend/src/modules/legal-entity/services/payment-scheme.service.ts`
   - Follow existing service patterns in the codebase

2. **Business Logic Implementation**:
   - Scheme creation with type-specific validation
   - Configuration validation and default setting
   - Operational availability checking
   - Fee calculation and spread management

3. **Validation Layer**:
   - Type-specific configuration validation
   - Cross-field consistency checking
   - Currency and timezone validation
   - Business rule enforcement

4. **Configuration Management**:
   - Default value assignment based on scheme type
   - Configuration override validation
   - Scheme template management
   - Migration and versioning support

5. **Operational Methods**:
   - Real-time availability checking
   - Fee calculation for payment amounts
   - Scheme compatibility validation
   - Performance metrics and monitoring

6. **Integration Points**:
   - Repository layer interaction
   - External validation services
   - Event emission for scheme changes
   - Caching for performance optimization

## File Paths to Read
- `backend/src/modules/legal-entity/services/legal-entity.service.ts` - Reference for service patterns
- `backend/src/modules/auth/services/auth.service.ts` - Additional service examples
- `backend/src/modules/legal-entity/repositories/payment-scheme.repository.ts` - Repository interface

## Relevant Code Snippets

### Service Implementation
```typescript
import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PaymentSchemeRepository, PaymentSchemeFilters, PaginationOptions } from '../repositories/payment-scheme.repository';
import { PaymentScheme, PaymentSchemeType, OperatingHours, FeeStructure, AmountLimits } from '../entities/payment-scheme.entity';

export interface CreatePaymentSchemeData {
  name: string;
  type: PaymentSchemeType;
  currency: string;
  target_currency?: string;
  country_scope: string;
  available_days?: string[];
  operating_hours?: OperatingHours;
  holiday_calendar?: string[];
  cut_off_time?: string;
  settlement_time?: string;
  fees?: FeeStructure;
  spread?: number;
  limits?: AmountLimits;
  supports_fx?: boolean;
}

export interface UpdatePaymentSchemeData {
  name?: string;
  currency?: string;
  target_currency?: string;
  country_scope?: string;
  available_days?: string[];
  operating_hours?: OperatingHours;
  holiday_calendar?: string[];
  cut_off_time?: string;
  settlement_time?: string;
  fees?: FeeStructure;
  spread?: number;
  limits?: AmountLimits;
  supports_fx?: boolean;
}

export interface SchemeAvailabilityResult {
  scheme_id: string;
  is_operational: boolean;
  next_availability?: Date;
  restrictions?: string[];
}

export interface FeeCalculationResult {
  base_amount: number;
  total_fee: number;
  fee_breakdown: {
    flat_fee?: number;
    percentage_fee?: number;
    fx_spread_fee?: number;
  };
  final_amount: number;
}

@Injectable()
export class PaymentSchemeService {
  private readonly logger = new Logger(PaymentSchemeService.name);

  constructor(
    private readonly paymentSchemeRepository: PaymentSchemeRepository,
  ) {}

  /**
   * Create a new payment scheme with validation and defaults
   */
  async createPaymentScheme(data: CreatePaymentSchemeData): Promise<PaymentScheme> {
    this.logger.debug(`Creating payment scheme: ${data.name}`);

    // Validate basic data
    await this.validateSchemeData(data);

    // Apply type-specific defaults
    const schemeData = this.applyTypeDefaults(data);

    // Validate configuration consistency
    this.validateSchemeConfiguration(schemeData);

    try {
      const paymentScheme = await this.paymentSchemeRepository.create(schemeData);
      this.logger.log(`Payment scheme created: ${paymentScheme.scheme_id}`);
      return paymentScheme;
    } catch (error) {
      this.logger.error(`Failed to create payment scheme: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create payment scheme: ${error.message}`);
    }
  }

  /**
   * Get payment scheme by ID
   */
  async getPaymentScheme(schemeId: string): Promise<PaymentScheme> {
    this.logger.debug(`Getting payment scheme: ${schemeId}`);

    const paymentScheme = await this.paymentSchemeRepository.findById(schemeId);
    if (!paymentScheme) {
      throw new NotFoundException(`Payment scheme not found: ${schemeId}`);
    }

    return paymentScheme;
  }

  /**
   * Get payment schemes with filtering and pagination
   */
  async getPaymentSchemes(filters: PaymentSchemeFilters = {}, pagination: PaginationOptions = {}) {
    this.logger.debug('Getting payment schemes with filters');
    return this.paymentSchemeRepository.findMany(filters, pagination);
  }

  /**
   * Update payment scheme
   */
  async updatePaymentScheme(schemeId: string, updates: UpdatePaymentSchemeData): Promise<PaymentScheme> {
    this.logger.debug(`Updating payment scheme: ${schemeId}`);

    // Check if scheme exists
    const existingScheme = await this.getPaymentScheme(schemeId);

    // Validate updates
    const updatedData = { ...existingScheme, ...updates };
    this.validateSchemeConfiguration(updatedData);

    try {
      const updated = await this.paymentSchemeRepository.update(schemeId, updates);
      this.logger.log(`Payment scheme updated: ${schemeId}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update payment scheme: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to update payment scheme: ${error.message}`);
    }
  }

  /**
   * Delete payment scheme
   */
  async deletePaymentScheme(schemeId: string): Promise<void> {
    this.logger.debug(`Deleting payment scheme: ${schemeId}`);

    // Check if scheme exists
    await this.getPaymentScheme(schemeId);

    // TODO: Check if scheme is in use by payment methods
    // This would require checking against payment_methods table once it exists

    try {
      await this.paymentSchemeRepository.delete(schemeId);
      this.logger.log(`Payment scheme deleted: ${schemeId}`);
    } catch (error) {
      this.logger.error(`Failed to delete payment scheme: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to delete payment scheme: ${error.message}`);
    }
  }

  /**
   * Get schemes by type
   */
  async getSchemesByType(type: PaymentSchemeType): Promise<PaymentScheme[]> {
    this.logger.debug(`Getting schemes by type: ${type}`);
    return this.paymentSchemeRepository.findByType(type);
  }

  /**
   * Get schemes supporting a currency
   */
  async getSchemesByCurrency(currency: string): Promise<PaymentScheme[]> {
    this.logger.debug(`Getting schemes by currency: ${currency}`);
    
    // Validate currency format
    if (!currency.match(/^[A-Z]{3}$/)) {
      throw new BadRequestException('Currency must be a 3-letter ISO code');
    }

    return this.paymentSchemeRepository.findByCurrency(currency);
  }

  /**
   * Get currently operational schemes
   */
  async getOperationalSchemes(currentTime?: Date): Promise<PaymentScheme[]> {
    this.logger.debug('Getting operational schemes');
    return this.paymentSchemeRepository.findOperationalSchemes(currentTime);
  }

  /**
   * Check scheme availability for specific time
   */
  async checkSchemeAvailability(schemeId: string, checkTime?: Date): Promise<SchemeAvailabilityResult> {
    this.logger.debug(`Checking scheme availability: ${schemeId}`);

    const scheme = await this.getPaymentScheme(schemeId);
    const currentTime = checkTime || new Date();
    
    const isOperational = scheme.isOperational(currentTime);
    const restrictions: string[] = [];

    // Add specific restriction details
    if (!isOperational) {
      const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      if (!scheme.available_days.includes(dayName)) {
        restrictions.push(`Not operational on ${dayName}`);
      }

      const currentDate = currentTime.toISOString().split('T')[0];
      if (scheme.holiday_calendar?.includes(currentDate)) {
        restrictions.push('Holiday calendar restriction');
      }

      if (scheme.type !== PaymentSchemeType.CRYPTO) {
        restrictions.push('Outside operating hours');
      }
    }

    return {
      scheme_id: schemeId,
      is_operational: isOperational,
      next_availability: isOperational ? undefined : this.calculateNextAvailability(scheme, currentTime),
      restrictions: restrictions.length > 0 ? restrictions : undefined,
    };
  }

  /**
   * Calculate fees for a payment amount
   */
  async calculatePaymentFees(
    schemeId: string, 
    amount: number, 
    sourceCurrency?: string, 
    targetCurrency?: string
  ): Promise<FeeCalculationResult> {
    this.logger.debug(`Calculating fees for scheme: ${schemeId}, amount: ${amount}`);

    const scheme = await this.getPaymentScheme(schemeId);

    // Validate amount is within limits
    if (!scheme.isAmountWithinLimits(amount)) {
      throw new BadRequestException('Amount exceeds scheme limits');
    }

    const feeBreakdown: FeeCalculationResult['fee_breakdown'] = {};
    let totalFee = 0;

    // Base scheme fees
    const baseFee = scheme.calculateFee(amount);
    totalFee += baseFee;

    if (scheme.fees?.flat_fee) {
      feeBreakdown.flat_fee = scheme.fees.flat_fee;
    }

    if (scheme.fees?.percentage_fee) {
      feeBreakdown.percentage_fee = amount * scheme.fees.percentage_fee;
    }

    // FX spread fees (if applicable)
    if (scheme.type === PaymentSchemeType.FX && scheme.spread && sourceCurrency && targetCurrency) {
      const fxSpreadFee = amount * scheme.spread;
      feeBreakdown.fx_spread_fee = fxSpreadFee;
      totalFee += fxSpreadFee;
    }

    return {
      base_amount: amount,
      total_fee: totalFee,
      fee_breakdown: feeBreakdown,
      final_amount: amount + totalFee,
    };
  }

  /**
   * Validate payment scheme compatibility
   */
  async validateSchemeCompatibility(
    schemeId: string, 
    sourceCurrency: string, 
    targetCurrency: string, 
    amount: number
  ): Promise<boolean> {
    this.logger.debug(`Validating scheme compatibility: ${schemeId}`);

    const scheme = await this.getPaymentScheme(schemeId);

    // Check currency support
    const supportedCurrencies = [scheme.currency];
    if (scheme.target_currency) {
      supportedCurrencies.push(scheme.target_currency);
    }

    const currenciesSupported = supportedCurrencies.includes(sourceCurrency) && 
                               supportedCurrencies.includes(targetCurrency);

    // Check FX requirements
    const fxRequired = sourceCurrency !== targetCurrency;
    const fxSupported = scheme.supports_fx;

    if (fxRequired && !fxSupported) {
      return false;
    }

    // Check amount limits
    if (!scheme.isAmountWithinLimits(amount)) {
      return false;
    }

    // Check operational status
    if (!scheme.isOperational()) {
      return false;
    }

    return currenciesSupported;
  }

  /**
   * Apply type-specific defaults to scheme data
   */
  private applyTypeDefaults(data: CreatePaymentSchemeData): CreatePaymentSchemeData {
    const defaults = { ...data };

    switch (data.type) {
      case PaymentSchemeType.CRYPTO:
        defaults.available_days = defaults.available_days || [
          'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
        ];
        defaults.operating_hours = defaults.operating_hours || {
          start: '00:00',
          end: '23:59',
          timezone: 'UTC'
        };
        defaults.settlement_time = defaults.settlement_time || 'instant';
        defaults.supports_fx = defaults.supports_fx !== undefined ? defaults.supports_fx : false;
        break;

      case PaymentSchemeType.FIAT:
        defaults.available_days = defaults.available_days || [
          'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
        ];
        defaults.operating_hours = defaults.operating_hours || {
          start: '08:00',
          end: '18:00',
          timezone: 'Europe/London'
        };
        defaults.settlement_time = defaults.settlement_time || 'T+1';
        defaults.cut_off_time = defaults.cut_off_time || '16:00';
        defaults.supports_fx = defaults.supports_fx !== undefined ? defaults.supports_fx : true;
        break;

      case PaymentSchemeType.FX:
        defaults.available_days = defaults.available_days || [
          'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
        ];
        defaults.operating_hours = defaults.operating_hours || {
          start: '07:00',
          end: '17:00',
          timezone: 'Europe/London'
        };
        defaults.settlement_time = defaults.settlement_time || 'T+2';
        defaults.supports_fx = true; // Always true for FX schemes
        defaults.spread = defaults.spread !== undefined ? defaults.spread : 0.001; // 0.1% default spread
        break;
    }

    defaults.holiday_calendar = defaults.holiday_calendar || [];
    defaults.fees = defaults.fees || {};
    defaults.limits = defaults.limits || {};

    return defaults;
  }

  /**
   * Validate scheme data consistency
   */
  private validateSchemeData(data: CreatePaymentSchemeData): void {
    // Currency validation
    if (!data.currency.match(/^[A-Z]{3}$/)) {
      throw new BadRequestException('Currency must be a 3-letter ISO code');
    }

    if (data.target_currency && !data.target_currency.match(/^[A-Z]{3}$/)) {
      throw new BadRequestException('Target currency must be a 3-letter ISO code');
    }

    // Type-specific validations
    if (data.type === PaymentSchemeType.FX && !data.target_currency) {
      throw new BadRequestException('FX schemes must have a target currency');
    }

    if (data.spread !== undefined && (data.spread < 0 || data.spread > 1)) {
      throw new BadRequestException('Spread must be between 0 and 1');
    }
  }

  /**
   * Validate scheme configuration consistency
   */
  private validateSchemeConfiguration(scheme: any): void {
    const errors = [];

    // Use entity validation method
    if (scheme.validateConfiguration) {
      errors.push(...scheme.validateConfiguration());
    }

    // Additional service-level validations
    if (scheme.operating_hours) {
      const { start, end } = scheme.operating_hours;
      if (start >= end) {
        errors.push('Operating hours start time must be before end time');
      }
    }

    if (scheme.limits) {
      if (scheme.limits.min_amount && scheme.limits.max_amount) {
        if (scheme.limits.min_amount >= scheme.limits.max_amount) {
          errors.push('Minimum amount must be less than maximum amount');
        }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Calculate next availability time for a scheme
   */
  private calculateNextAvailability(scheme: PaymentScheme, currentTime: Date): Date {
    // Simplified implementation - in production this would need proper timezone handling
    const nextDay = new Date(currentTime);
    nextDay.setDate(nextDay.getDate() + 1);
    
    if (scheme.operating_hours) {
      const [startHour, startMinute] = scheme.operating_hours.start.split(':').map(Number);
      nextDay.setHours(startHour, startMinute, 0, 0);
    }
    
    return nextDay;
  }
}
```

## API Endpoint Details
N/A - This is a service layer implementation that will be used by controllers.

## Database Schema Changes
N/A - Service uses existing repository layer.

## Libraries/Dependencies
- @nestjs/common (already available)
- PaymentSchemeRepository (from previous task)
- PaymentScheme entity (from previous task)

## Potential Challenges and Solutions

1. **Complex Validation Logic**:
   - Challenge: Type-specific validation rules and cross-field dependencies
   - Solution: Use entity validation methods combined with service-level business rule validation

2. **Time Zone Handling**:
   - Challenge: Operating hours across different time zones and holiday calendars
   - Solution: Store timezone information and use proper date libraries for calculations

3. **Fee Calculation Complexity**:
   - Challenge: Multiple fee types, FX spreads, and currency conversions
   - Solution: Break down into separate calculation methods with clear interfaces

4. **Configuration Flexibility vs Validation**:
   - Challenge: Supporting flexible JSON configurations while maintaining data integrity
   - Solution: Use type-specific defaults and validation with clear error messages

## Test Cases to Consider

1. **Scheme Creation**:
   - Create schemes of different types with valid data
   - Validate type-specific default application
   - Reject invalid configuration combinations
   - Handle missing required fields

2. **Business Logic**:
   - Operational availability checking across time zones
   - Fee calculation for different scenarios
   - Scheme compatibility validation
   - Amount limit enforcement

3. **Validation**:
   - Currency code format validation
   - Cross-field consistency checking
   - Type-specific configuration requirements
   - Business rule enforcement

4. **Error Handling**:
   - Non-existent scheme operations
   - Invalid update attempts
   - Configuration validation failures
   - Repository error propagation

5. **Performance**:
   - Bulk operations efficiency
   - Operational scheme filtering performance
   - Fee calculation optimization
   - Configuration validation speed
