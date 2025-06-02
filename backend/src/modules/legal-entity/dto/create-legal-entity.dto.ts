
import { IsNotEmpty, IsString, MaxLength, IsEnum, IsOptional, Matches, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LegalEntityType } from '../entities/legal-entity.entity';

export class CreateLegalEntityDto {
  @ApiProperty({
    description: 'Human-readable name of the legal entity',
    example: 'Example Bank Ltd',
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code where the entity is registered',
    example: 'US',
    pattern: '^[A-Z]{2}$'
  })
  @IsNotEmpty()
  @Matches(/^[A-Z]{2}$/, { message: 'Country must be a valid 2-character ISO code' })
  country: string;

  @ApiProperty({
    description: 'Type of legal entity which determines its capabilities',
    enum: LegalEntityType,
    example: LegalEntityType.BANK
  })
  @IsEnum(LegalEntityType)
  entityType: LegalEntityType;

  @ApiProperty({
    description: 'Timezone identifier for the entity operational timezone',
    example: 'America/New_York'
  })
  @IsNotEmpty()
  @IsString()
  timezone: string;

  @ApiProperty({
    description: 'Optional regulatory scope or jurisdiction details',
    example: 'Federal',
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  regulatoryScope?: string;

  @ApiProperty({
    description: 'Parent entity ID for branch entities (only for branch type)',
    example: '01H5EXAMPLE1234567890',
    required: false
  })
  @IsOptional()
  @IsString()
  parentEntityId?: string;
}
