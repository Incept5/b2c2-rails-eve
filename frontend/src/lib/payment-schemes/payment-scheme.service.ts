
import { env } from '../env';
import { 
  PaymentScheme, 
  CreatePaymentSchemeDto, 
  UpdatePaymentSchemeDto, 
  PaymentSchemeFilters, 
  PaginatedPaymentSchemesResponse,
  SchemeAvailability,
  FeeCalculation,
  SchemeCompatibility,
  PaymentSchemeType,
  ApiError 
} from './payment-scheme.types';

/**
 * API service for Payment Scheme operations
 * Handles all HTTP communication with the backend
 */
export class PaymentSchemeService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `${env.VITE_API_URL}/api/payment-schemes`;
  }

  /**
   * Get paginated list of payment schemes with optional filtering
   */
  async getSchemes(filters?: PaymentSchemeFilters): Promise<PaginatedPaymentSchemesResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.type) params.append('type', filters.type);
      if (filters?.currency) params.append('currency', filters.currency);
      if (filters?.country_scope) params.append('country_scope', filters.country_scope);
      if (filters?.supports_fx !== undefined) params.append('supports_fx', filters.supports_fx.toString());
      if (filters?.operational_only !== undefined) params.append('operational_only', filters.operational_only.toString());

      const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific payment scheme by ID
   */
  async getScheme(schemeId: string): Promise<PaymentScheme> {
    try {
      const response = await fetch(`${this.baseUrl}/${schemeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new payment scheme
   */
  async createScheme(data: CreatePaymentSchemeDto): Promise<PaymentScheme> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing payment scheme
   */
  async updateScheme(schemeId: string, data: UpdatePaymentSchemeDto): Promise<PaymentScheme> {
    try {
      const response = await fetch(`${this.baseUrl}/${schemeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a payment scheme
   */
  async deleteScheme(schemeId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${schemeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment schemes by type
   */
  async getSchemesByType(type: PaymentSchemeType): Promise<PaymentScheme[]> {
    try {
      const response = await fetch(`${this.baseUrl}/types/${type}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment schemes by currency
   */
  async getSchemesByCurrency(currency: string): Promise<PaymentScheme[]> {
    try {
      const response = await fetch(`${this.baseUrl}/currency/${currency}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get currently operational payment schemes
   */
  async getOperationalSchemes(): Promise<PaymentScheme[]> {
    try {
      const response = await fetch(`${this.baseUrl}/operational/current`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check payment scheme availability
   */
  async checkSchemeAvailability(schemeId: string, checkTime?: Date): Promise<SchemeAvailability> {
    try {
      const params = new URLSearchParams();
      if (checkTime) {
        params.append('check_time', checkTime.toISOString());
      }

      const url = params.toString() 
        ? `${this.baseUrl}/${schemeId}/availability?${params.toString()}`
        : `${this.baseUrl}/${schemeId}/availability`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate payment fees for a scheme
   */
  async calculateFees(
    schemeId: string,
    amount: number,
    sourceCurrency?: string,
    targetCurrency?: string
  ): Promise<FeeCalculation> {
    try {
      const body: any = { amount };
      if (sourceCurrency) body.source_currency = sourceCurrency;
      if (targetCurrency) body.target_currency = targetCurrency;

      const response = await fetch(`${this.baseUrl}/${schemeId}/calculate-fees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate scheme compatibility with currency pair and amount
   */
  async validateCompatibility(
    schemeId: string,
    sourceCurrency: string,
    targetCurrency: string,
    amount: number
  ): Promise<SchemeCompatibility> {
    try {
      const response = await fetch(`${this.baseUrl}/${schemeId}/validate-compatibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_currency: sourceCurrency,
          target_currency: targetCurrency,
          amount: amount,
        }),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle HTTP error responses
   */
  private async handleErrorResponse(response: Response): Promise<ApiError> {
    let message = 'An unexpected error occurred';
    
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {
      // If response body is not JSON, use status text
      message = response.statusText || message;
    }

    return {
      message,
      statusCode: response.status,
    };
  }

  /**
   * Handle general errors
   */
  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'object' && error.message) {
      return new Error(error.message);
    }
    
    return new Error('An unexpected error occurred');
  }
}

// Export singleton instance
export const paymentSchemeService = new PaymentSchemeService();
