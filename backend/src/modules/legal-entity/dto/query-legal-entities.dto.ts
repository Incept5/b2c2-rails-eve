
import { IsOptional, IsEnum, Matches, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LegalEntityType } from '../entities/legal-entity.entity';

export class QueryLegalEntitiesDto {
  @ApiProperty({
    description: 'Filter by country code',
    example: 'US',
    pattern: '^[A-Z]{2}$',
    required: false
  })
  @IsOptional()
  @Matches(/^[A-Z]{2}$/, { message: 'Country must be a valid 2-character ISO code' })
  country?: string;

  @ApiProperty({
    description: 'Filter by entity type',
    enum: LegalEntityType,
    example: LegalEntityType.BANK,
    required: false
  })
  @IsOptional()
  @IsEnum(LegalEntityType)
  entityType?: LegalEntityType;

  @ApiProperty({
    description: 'Filter by parent entity ID (to find branches)',
    example: '01H5EXAMPLE1234567890',
    required: false
  })
  @IsOptional()
  parentEntityId?: string;

  @ApiProperty({
    description: 'Filter by entities that can host accounts',
    example: true,
    required: false
  })
  @IsOptional()
  @Type(() => Boolean)
  canHostAccounts?: boolean;

  @ApiProperty({
    description: 'Filter by entities that can host wallets',
    example: false,
    required: false
  })
  @IsOptional()
  @Type(() => Boolean)
  canHostWallets?: boolean;

  @ApiProperty({
    description: 'Filter by entities that can host FX nodes',
    example: false,
    required: false
  })
  @IsOptional()
  @Type(() => Boolean)
  canHostFxNodes?: boolean;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
