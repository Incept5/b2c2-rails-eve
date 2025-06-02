
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLegalEntityDto {
  @ApiProperty({
    description: 'Human-readable name of the legal entity',
    example: 'Updated Bank Ltd',
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code where the entity is registered',
    example: 'CA',
    pattern: '^[A-Z]{2}$',
    required: false
  })
  @IsOptional()
  @Matches(/^[A-Z]{2}$/, { message: 'Country must be a valid 2-character ISO code' })
  country?: string;

  @ApiProperty({
    description: 'Timezone identifier for the entity operational timezone',
    example: 'America/Toronto',
    required: false
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    description: 'Optional regulatory scope or jurisdiction details',
    example: 'Provincial',
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  regulatoryScope?: string;
}
