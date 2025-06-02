
import { Module } from '@nestjs/common';
import { LegalEntityController } from './controllers/legal-entity.controller';
import { PaymentSchemeController } from './controllers/payment-scheme.controller';
import { LegalEntityService } from './services/legal-entity.service';
import { PaymentSchemeService } from './services/payment-scheme.service';
import { LegalEntityRepository } from './repositories/legal-entity.repository';
import { PaymentSchemeRepository } from './repositories/payment-scheme.repository';

@Module({
  imports: [
    // DatabaseModule is already available globally
  ],
  controllers: [
    LegalEntityController,
    PaymentSchemeController,
  ],
  providers: [
    LegalEntityService,
    LegalEntityRepository,
    PaymentSchemeService,
    PaymentSchemeRepository,
  ],
  exports: [
    LegalEntityService, // Export for use by other modules
    PaymentSchemeService, // Export for use by other modules
  ],
})
export class LegalEntityModule {}
