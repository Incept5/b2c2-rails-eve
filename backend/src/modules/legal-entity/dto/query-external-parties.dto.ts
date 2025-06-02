import { IsOptional, IsEnum, IsString, IsBoolean, IsInt, Min, Max, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { ExternalPartyType, KycStatus } from '../entities/external-party.entity';

export class QueryExternalPartiesDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Field to sort by',
    example: 'created_at',
    enum: ['name', 'type', 'jurisdiction', 'kyc_status', 'relationship_start', 'created_at', 'updated_at'],
    required: false,
    default: 'created_at'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    description: 'Filter by external party type',
    enum: ExternalPartyType,
    example: ExternalPartyType.CLIENT,
    required: false
  })
  @IsOptional()
  @IsEnum(ExternalPartyType)
  type?: ExternalPartyType;

  @ApiProperty({
    description: 'Filter by jurisdiction (ISO 3166-1 alpha-2 country code)',
    example: 'US',
    pattern: '^[A-Z]{2}$',
    required: false
  })
  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @ApiProperty({
    description: 'Filter by KYC status',
    enum: KycStatus,
    example: KycStatus.VERIFIED,
    required: false
  })
  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus;

  @ApiProperty({
    description: 'Filter by relationship start date (before this date)',
    example: '2025-01-01T00:00:00Z',
    type: 'string',
    format: 'date-time',
    required: false
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  relationshipStartBefore?: Date;

  @ApiProperty({
    description: 'Filter by relationship start date (after this date)',
    example: '2024-01-01T00:00:00Z',
    type: 'string',
    format: 'date-time',
    required: false
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  relationshipStartAfter?: Date;

  @ApiProperty({
    description: 'Filter by whether party has notes',
    example: true,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  hasNotes?: boolean;

  @ApiProperty({
    description: 'Filter to only parties requiring compliance review',
    example: false,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  requiresReview?: boolean;

  @ApiProperty({
    description: 'Search term to filter by party name (case-insensitive partial match)',
    example: 'ACME',
    maxLength: 100,
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;
}
