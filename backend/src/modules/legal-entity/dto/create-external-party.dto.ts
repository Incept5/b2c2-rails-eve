import { IsNotEmpty, IsString, MaxLength, IsEnum, IsOptional, Matches, IsDateString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ExternalPartyType, KycStatus } from '../entities/external-party.entity';

export class CreateExternalPartyDto {
  @ApiProperty({
    description: 'Human-readable name of the external party',
    example: 'ACME Corporation',
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Type of external party which determines business rules and capabilities',
    enum: ExternalPartyType,
    example: ExternalPartyType.CLIENT
  })
  @IsEnum(ExternalPartyType)
  type: ExternalPartyType;

  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code for the party jurisdiction',
    example: 'US',
    pattern: '^[A-Z]{2}$'
  })
  @IsNotEmpty()
  @Matches(/^[A-Z]{2}$/, { message: 'Jurisdiction must be a valid 2-character ISO country code' })
  jurisdiction: string;

  @ApiProperty({
    description: 'KYC verification status for compliance tracking (defaults to pending if not specified)',
    enum: KycStatus,
    example: KycStatus.PENDING,
    required: false
  })
  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus;

  @ApiProperty({
    description: 'Date when the relationship with this party began (defaults to current date if not specified)',
    example: '2025-01-15T00:00:00Z',
    type: 'string',
    format: 'date-time',
    required: false
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  relationshipStart?: Date;

  @ApiProperty({
    description: 'Optional free-form notes for compliance and operational information',
    example: 'Verified through enhanced due diligence process. Contact: john.doe@acme.com',
    maxLength: 10000,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  notes?: string;
}
