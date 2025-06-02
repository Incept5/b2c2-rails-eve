
import { Module } from '@nestjs/common';
import { LegalEntityController } from './controllers/legal-entity.controller';
import { LegalEntityService } from './services/legal-entity.service';
import { LegalEntityRepository } from './repositories/legal-entity.repository';

@Module({
  imports: [
    // DatabaseModule is already available globally
  ],
  controllers: [LegalEntityController],
  providers: [
    LegalEntityService,
    LegalEntityRepository,
  ],
  exports: [
    LegalEntityService, // Export for use by other modules
  ],
})
export class LegalEntityModule {}
