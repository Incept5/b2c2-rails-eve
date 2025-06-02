import { ApiProperty } from '@nestjs/swagger';
import { ExternalPartyType, KycStatus } from '../entities/external-party.entity';

export class ExternalPartyResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the external party (ULID)',
    example: '01H5EXTERNAL123456789'
  })
  externalId: string;

  @ApiProperty({
    description: 'Human-readable name of the external party',
    example: 'ACME Corporation'
  })
  name: string;

  @ApiProperty({
    description: 'Type of external party',
    enum: ExternalPartyType,
    example: ExternalPartyType.CLIENT
  })
  type: ExternalPartyType;

  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code for the party jurisdiction',
    example: 'US'
  })
  jurisdiction: string;

  @ApiProperty({
    description: 'KYC verification status for compliance tracking',
    enum: KycStatus,
    example: KycStatus.VERIFIED
  })
  kycStatus: KycStatus;

  @ApiProperty({
    description: 'Date when the relationship with this party began',
    example: '2025-01-15T00:00:00Z'
  })
  relationshipStart: Date;

  @ApiProperty({
    description: 'Free-form notes for compliance and operational information',
    example: 'Verified through enhanced due diligence process',
    nullable: true
  })
  notes?: string;

  @ApiProperty({
    description: 'Timestamp when the party was created',
    example: '2025-02-06T10:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the party was last updated',
    example: '2025-02-06T10:00:00Z'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Business rules and capabilities for this party type',
    example: {
      requiresVerifiedKycForHighValue: true,
      canHaveMultipleAccounts: true,
      hasSpecialAccessRights: false,
      requiresComplianceNotes: true
    }
  })
  typeRules: {
    requiresVerifiedKycForHighValue: boolean;
    canHaveMultipleAccounts: boolean;
    hasSpecialAccessRights: boolean;
    requiresComplianceNotes: boolean;
  };

  @ApiProperty({
    description: 'Whether this party can be associated with high-value accounts',
    example: true
  })
  canHaveHighValueAccounts: boolean;

  @ApiProperty({
    description: 'Recommended actions for this party',
    example: ['KYC verification pending'],
    type: [String]
  })
  recommendedActions: string[];
}

export class PaginatedExternalPartiesResponseDto {
  @ApiProperty({
    description: 'Array of external parties',
    type: [ExternalPartyResponseDto]
  })
  data: ExternalPartyResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
    example: {
      hasNext: false,
      nextCursor: null,
      totalCount: 25
    }
  })
  pagination: {
    hasNext: boolean;
    nextCursor?: string;
    totalCount?: number;
  };
}

export class ExternalPartyStatisticsDto {
  @ApiProperty({
    description: 'Total number of external parties',
    example: 150
  })
  totalParties: number;

  @ApiProperty({
    description: 'Count of parties by type',
    example: {
      client: 100,
      provider: 35,
      employee: 15
    }
  })
  byType: Record<ExternalPartyType, number>;

  @ApiProperty({
    description: 'Count of parties by KYC status',
    example: {
      verified: 120,
      pending: 25,
      blocked: 5
    }
  })
  byKycStatus: Record<KycStatus, number>;

  @ApiProperty({
    description: 'Count of parties by jurisdiction',
    example: {
      US: 85,
      GB: 35,
      DE: 20,
      FR: 10
    }
  })
  byJurisdiction: Record<string, number>;
}

export class PartiesRequiringAttentionDto {
  @ApiProperty({
    description: 'Parties with blocked KYC status',
    type: [ExternalPartyResponseDto]
  })
  blockedParties: ExternalPartyResponseDto[];

  @ApiProperty({
    description: 'Parties requiring compliance review',
    type: [ExternalPartyResponseDto]
  })
  pendingReview: ExternalPartyResponseDto[];

  @ApiProperty({
    description: 'Parties missing required compliance information',
    type: [ExternalPartyResponseDto]
  })
  missingCompliance: ExternalPartyResponseDto[];
}

export class BulkKycUpdateResponseDto {
  @ApiProperty({
    description: 'Party IDs that were successfully updated',
    example: ['01H5EXTERNAL123456789', '01H5EXTERNAL987654321'],
    type: [String]
  })
  successful: string[];

  @ApiProperty({
    description: 'Parties that failed to update with error details',
    example: [
      {
        partyId: '01H5EXTERNAL111111111',
        error: 'Invalid KYC transition from verified to pending'
      }
    ]
  })
  failed: Array<{
    partyId: string;
    error: string;
  }>;

  @ApiProperty({
    description: 'Summary of the bulk operation',
    example: {
      totalRequested: 3,
      successfulCount: 2,
      failedCount: 1
    }
  })
  summary: {
    totalRequested: number;
    successfulCount: number;
    failedCount: number;
  };
}
