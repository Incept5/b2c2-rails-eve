
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePaymentSchemeDto } from './create-payment-scheme.dto';

export class UpdatePaymentSchemeDto extends PartialType(
  OmitType(CreatePaymentSchemeDto, ['type'] as const)
) {
  // All fields from CreatePaymentSchemeDto are optional except 'type'
  // Type cannot be changed after creation for data integrity
}
