import { IsOptional, IsString, MaxLength, Matches, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateExternalPartyDto {
  @ApiProperty({
    description: 'Human-readable name of the external party',
    example: 'ACME Corporation Ltd',
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code for the party jurisdiction',
    example: 'GB',
    pattern: '^[A-Z]{2}$',
    required: false
  })
  @IsOptional()
  @Matches(/^[A-Z]{2}$/, { message: 'Jurisdiction must be a valid 2-character ISO country code' })
  jurisdiction?: string;

  @ApiProperty({
    description: 'Date when the relationship with this party began',
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
    description: 'Free-form notes for compliance and operational information',
    example: 'Updated contact information. Primary contact: jane.smith@acme.com',
    maxLength: 10000,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  notes?: string;
}

export class UpdateKycStatusDto {
  @ApiProperty({
    description: 'New KYC status to transition to',
    enum: ['verified', 'pending', 'blocked'],
    example: 'verified'
  })
  @IsString()
  newStatus: 'verified' | 'pending' | 'blocked';

  @ApiProperty({
    description: 'Reason for the KYC status change',
    example: 'Completed enhanced due diligence verification',
    maxLength: 1000,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;

  @ApiProperty({
    description: 'Additional notes for the status change',
    example: 'Documents verified by compliance team on 2025-02-06',
    maxLength: 2000,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
