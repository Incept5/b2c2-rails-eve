
import { ApiProperty } from '@nestjs/swagger';
import { LegalEntityType } from '../entities/legal-entity.entity';

export class LegalEntityResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the legal entity (ULID)',
    example: '01H5EXAMPLE1234567890'
  })
  entityId: string;

  @ApiProperty({
    description: 'Human-readable name of the legal entity',
    example: 'Example Bank Ltd'
  })
  name: string;

  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code where the entity is registered',
    example: 'US'
  })
  country: string;

  @ApiProperty({
    description: 'Type of legal entity',
    enum: LegalEntityType,
    example: LegalEntityType.BANK
  })
  entityType: LegalEntityType;

  @ApiProperty({
    description: 'Timezone identifier for the entity operational timezone',
    example: 'America/New_York'
  })
  timezone: string;

  @ApiProperty({
    description: 'Optional regulatory scope or jurisdiction details',
    example: 'Federal',
    nullable: true
  })
  regulatoryScope?: string;

  @ApiProperty({
    description: 'Parent entity ID for branch entities',
    example: '01H5PARENT1234567890',
    nullable: true
  })
  parentEntityId?: string;

  @ApiProperty({
    description: 'Whether this entity can host bank accounts',
    example: true
  })
  canHostAccounts: boolean;

  @ApiProperty({
    description: 'Whether this entity can host crypto wallets',
    example: false
  })
  canHostWallets: boolean;

  @ApiProperty({
    description: 'Whether this entity can host FX nodes',
    example: false
  })
  canHostFxNodes: boolean;

  @ApiProperty({
    description: 'Timestamp when the entity was created',
    example: '2025-02-06T10:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the entity was last updated',
    example: '2025-02-06T10:00:00Z'
  })
  updatedAt: Date;
}

export class PaginationDto {
  @ApiProperty({
    description: 'Whether there are more results available',
    example: false
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Cursor for the next page of results',
    example: 'eyJpZCI6IjAxSDVFWEFNUExFMTIzNDU2Nzg5MCJ9',
    nullable: true
  })
  nextCursor?: string;

  @ApiProperty({
    description: 'Total count of results (only provided for offset pagination)',
    example: 25,
    nullable: true
  })
  totalCount?: number;
}

export class PaginatedLegalEntitiesResponseDto {
  @ApiProperty({
    description: 'Array of legal entities',
    type: [LegalEntityResponseDto]
  })
  data: LegalEntityResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto
  })
  pagination: PaginationDto;
}
