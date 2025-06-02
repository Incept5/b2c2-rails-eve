
import { env } from '../env';
import { 
  LegalEntity, 
  CreateLegalEntityDto, 
  UpdateLegalEntityDto, 
  EntityFilters, 
  PaginatedLegalEntitiesResponse,
  ApiError 
} from './legal-entity.types';

/**
 * API service for Legal Entity operations
 * Handles all HTTP communication with the backend
 */
export class LegalEntityService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `${env.VITE_API_URL}/api/legal-entities`;
  }

  /**
   * Get paginated list of legal entities with optional filtering
   */
  async getEntities(filters?: EntityFilters): Promise<PaginatedLegalEntitiesResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.country) params.append('country', filters.country);
      if (filters?.entityType) params.append('entityType', filters.entityType);
      if (filters?.parentEntityId) params.append('parentEntityId', filters.parentEntityId);
      if (filters?.canHostAccounts !== undefined) params.append('canHostAccounts', filters.canHostAccounts.toString());
      if (filters?.canHostWallets !== undefined) params.append('canHostWallets', filters.canHostWallets.toString());
      if (filters?.canHostFxNodes !== undefined) params.append('canHostFxNodes', filters.canHostFxNodes.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

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
   * Get a specific legal entity by ID
   */
  async getEntity(entityId: string): Promise<LegalEntity> {
    try {
      const response = await fetch(`${this.baseUrl}/${entityId}`, {
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
   * Create a new legal entity
   */
  async createEntity(data: CreateLegalEntityDto): Promise<LegalEntity> {
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
   * Update an existing legal entity
   */
  async updateEntity(entityId: string, data: UpdateLegalEntityDto): Promise<LegalEntity> {
    try {
      const response = await fetch(`${this.baseUrl}/${entityId}`, {
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
   * Delete a legal entity
   */
  async deleteEntity(entityId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${entityId}`, {
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
   * Get child entities (branches) of a legal entity
   */
  async getEntityChildren(entityId: string): Promise<LegalEntity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${entityId}/children`, {
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
export const legalEntityService = new LegalEntityService();
