
// Type definitions for Legal Entity frontend
export enum LegalEntityType {
  BANK = 'bank',
  EXCHANGER = 'exchanger',
  PAYMENT_PROVIDER = 'payment_provider',
  CUSTODIAN = 'custodian',
  FX_PROVIDER = 'fx_provider',
  BRANCH = 'branch'
}

export interface LegalEntity {
  entityId: string;
  name: string;
  country: string;
  entityType: LegalEntityType;
  timezone: string;
  regulatoryScope?: string;
  parentEntityId?: string;
  canHostAccounts: boolean;
  canHostWallets: boolean;
  canHostFxNodes: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLegalEntityDto {
  name: string;
  country: string;
  entityType: LegalEntityType;
  timezone: string;
  regulatoryScope?: string;
  parentEntityId?: string;
}

export interface UpdateLegalEntityDto {
  name?: string;
  country?: string;
  timezone?: string;
  regulatoryScope?: string;
}

export interface EntityFilters {
  country?: string;
  entityType?: LegalEntityType;
  parentEntityId?: string;
  canHostAccounts?: boolean;
  canHostWallets?: boolean;
  canHostFxNodes?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  hasNext: boolean;
  nextCursor?: string;
  totalCount?: number;
}

export interface PaginatedLegalEntitiesResponse {
  data: LegalEntity[];
  pagination: PaginationInfo;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
