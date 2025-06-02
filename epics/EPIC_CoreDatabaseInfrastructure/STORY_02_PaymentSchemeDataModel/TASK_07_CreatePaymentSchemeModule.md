
---
type: "task"
task_id: "TASK_07_CreatePaymentSchemeModule"
story_id: "STORY_02_PaymentSchemeDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "todo"
---

# Task 7: Create Payment Scheme Module and Integration

## Task Title
Create PaymentSchemeModule and integrate with application architecture

## Detailed Description
Implement the NestJS module for payment schemes that ties together all components (controller, service, repository, entities, DTOs) and integrates with the main application module. This includes proper dependency injection setup, module exports, and integration with existing infrastructure components like database and logging.

## Technical Approach / Implementation Plan

1. **Create Module File**:
   - Create `backend/src/modules/legal-entity/payment-scheme.module.ts`
   - Follow existing module patterns in the codebase

2. **Module Configuration**:
   - Import required dependencies (DatabaseModule, LoggingModule)
   - Register all payment scheme components
   - Configure proper dependency injection
   - Export necessary services for other modules

3. **Integration with Legal Entity Module**:
   - Update existing legal-entity.module.ts to include payment scheme components
   - Ensure proper module organization and separation of concerns
   - Handle cross-module dependencies appropriately

4. **Main Application Integration**:
   - Update app.module.ts to include payment scheme functionality
   - Ensure proper module loading order
   - Configure any global middleware or interceptors

5. **Database Integration**:
   - Ensure payment scheme repository uses existing database service
   - Verify migration execution order
   - Test database connectivity and operations

6. **Testing Integration**:
   - Create basic module testing setup
   - Verify dependency injection works correctly
   - Test module bootstrapping and shutdown

## File Paths to Read
- `backend/src/modules/legal-entity/legal-entity.module.ts` - Existing module structure
- `backend/src/app.module.ts` - Main application module
- `backend/src/modules/database/database.module.ts` - Database module integration
- `backend/src/modules/logging/logging.module.ts` - Logging module integration

## Relevant Code Snippets

### Payment Scheme Module
```typescript
// payment-scheme.module.ts
import { Module } from '@nestjs/common';
import { PaymentSchemeController } from './controllers/payment-scheme.controller';
import { PaymentSchemeService } from './services/payment-scheme.service';
import { PaymentSchemeRepository } from './repositories/payment-scheme.repository';
import { DatabaseModule } from '../database/database.module';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [
    DatabaseModule,
    LoggingModule,
  ],
  controllers: [
    PaymentSchemeController,
  ],
  providers: [
    PaymentSchemeService,
    PaymentSchemeRepository,
  ],
  exports: [
    PaymentSchemeService,
    PaymentSchemeRepository,
  ],
})
export class PaymentSchemeModule {}
```

### Updated Legal Entity Module
```typescript
// legal-entity.module.ts (updated)
import { Module } from '@nestjs/common';
import { LegalEntityController } from './controllers/legal-entity.controller';
import { LegalEntityService } from './services/legal-entity.service';
import { LegalEntityRepository } from './repositories/legal-entity.repository';
import { PaymentSchemeModule } from './payment-scheme.module';
import { DatabaseModule } from '../database/database.module';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [
    DatabaseModule,
    LoggingModule,
    PaymentSchemeModule,
  ],
  controllers: [
    LegalEntityController,
  ],
  providers: [
    LegalEntityService,
    LegalEntityRepository,
  ],
  exports: [
    LegalEntityService,
    LegalEntityRepository,
    PaymentSchemeModule,
  ],
})
export class LegalEntityModule {}
```

### Updated App Module
```typescript
// app.module.ts (updated sections)
import { Module } from '@nestjs/common';
import { LegalEntityModule } from './modules/legal-entity/legal-entity.module';
import { DatabaseModule } from './modules/database/database.module';
import { LoggingModule } from './modules/logging/logging.module';
import { AuthModule } from './modules/auth/auth.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { SwaggerModule } from './modules/swagger/swagger.module';
import { ValidationModule } from './modules/validation/validation.module';
import { ErrorModule } from './modules/error/error.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './modules/error/http-exception.filter';
import { RequestLoggerInterceptor } from './modules/logging/request-logger.interceptor';
import { ValidationPipe } from './modules/validation/validation.pipe';

@Module({
  imports: [
    // Core infrastructure modules
    DatabaseModule,
    LoggingModule,
    ValidationModule,
    ErrorModule,
    
    // Feature modules
    AuthModule,
    LegalEntityModule, // This now includes PaymentSchemeModule
    
    // Utility modules
    MonitoringModule,
    SwaggerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
```

### Module Testing Setup
```typescript
// payment-scheme.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentSchemeModule } from './payment-scheme.module';
import { PaymentSchemeController } from './controllers/payment-scheme.controller';
import { PaymentSchemeService } from './services/payment-scheme.service';
import { PaymentSchemeRepository } from './repositories/payment-scheme.repository';
import { DatabaseModule } from '../database/database.module';
import { LoggingModule } from '../logging/logging.module';

describe('PaymentSchemeModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PaymentSchemeModule, DatabaseModule, LoggingModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have PaymentSchemeController', () => {
    const controller = module.get<PaymentSchemeController>(PaymentSchemeController);
    expect(controller).toBeDefined();
  });

  it('should have PaymentSchemeService', () => {
    const service = module.get<PaymentSchemeService>(PaymentSchemeService);
    expect(service).toBeDefined();
  });

  it('should have PaymentSchemeRepository', () => {
    const repository = module.get<PaymentSchemeRepository>(PaymentSchemeRepository);
    expect(repository).toBeDefined();
  });

  it('should export PaymentSchemeService', () => {
    const service = module.get<PaymentSchemeService>(PaymentSchemeService);
    expect(service).toBeDefined();
  });

  it('should export PaymentSchemeRepository', () => {
    const repository = module.get<PaymentSchemeRepository>(PaymentSchemeRepository);
    expect(repository).toBeDefined();
  });
});
```

### Integration Test Setup
```typescript
// payment-scheme.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { DatabaseService } from '../database/database.service';
import { PaymentSchemeService } from './services/payment-scheme.service';
import { PaymentSchemeType } from './entities/payment-scheme.entity';

describe('PaymentScheme Integration', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let paymentSchemeService: PaymentSchemeService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
    paymentSchemeService = moduleFixture.get<PaymentSchemeService>(PaymentSchemeService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await databaseService.getKnex()('payment_schemes').del();
  });

  it('should be able to create and retrieve payment schemes', async () => {
    const schemeData = {
      name: 'Test SEPA Scheme',
      type: PaymentSchemeType.FIAT,
      currency: 'EUR',
      country_scope: 'EU',
      settlement_time: 'T+1',
    };

    const created = await paymentSchemeService.createPaymentScheme(schemeData);
    expect(created.scheme_id).toBeDefined();
    expect(created.name).toBe(schemeData.name);

    const retrieved = await paymentSchemeService.getPaymentScheme(created.scheme_id);
    expect(retrieved).toBeDefined();
    expect(retrieved.scheme_id).toBe(created.scheme_id);
  });

  it('should integrate with database migrations', async () => {
    // Verify that the payment_schemes table exists and has correct structure
    const hasTable = await databaseService.getKnex().schema.hasTable('payment_schemes');
    expect(hasTable).toBe(true);

    const tableInfo = await databaseService.getKnex()('payment_schemes').columnInfo();
    expect(tableInfo.scheme_id).toBeDefined();
    expect(tableInfo.name).toBeDefined();
    expect(tableInfo.type).toBeDefined();
    expect(tableInfo.currency).toBeDefined();
  });
});
```

### Error Handling Integration
```typescript
// payment-scheme-error.integration.ts (part of controller or service)
import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentSchemeNotFoundException extends HttpException {
  constructor(schemeId: string) {
    super(
      {
        error: 'Payment scheme not found',
        message: `Payment scheme with ID ${schemeId} not found`,
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class PaymentSchemeValidationException extends HttpException {
  constructor(validationErrors: string[]) {
    super(
      {
        error: 'Payment scheme validation failed',
        message: 'Invalid payment scheme configuration',
        details: validationErrors,
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
```

## API Endpoint Details
N/A - Module configuration task that enables existing endpoints.

## Database Schema Changes
N/A - Module integrates existing database schema and migrations.

## Libraries/Dependencies
- @nestjs/common (already available)
- @nestjs/testing (for tests)
- DatabaseModule (existing)
- LoggingModule (existing)

## Potential Challenges and Solutions

1. **Circular Dependencies**:
   - Challenge: Potential circular imports between modules
   - Solution: Use forwardRef() when needed and proper module organization

2. **Database Connection Management**:
   - Challenge: Ensuring database connections are properly managed across modules
   - Solution: Use existing DatabaseModule singleton pattern

3. **Module Loading Order**:
   - Challenge: Dependencies between modules may require specific loading order
   - Solution: Structure imports properly and use async module configuration if needed

4. **Testing Integration**:
   - Challenge: Complex module testing with database dependencies
   - Solution: Use proper test module setup with database cleanup and isolation

## Test Cases to Consider

1. **Module Bootstrap**:
   - Module loads successfully
   - All dependencies are properly injected
   - Controllers and services are accessible
   - Exports work correctly

2. **Database Integration**:
   - Repository can connect to database
   - Migrations are executed properly
   - Database operations work through the module

3. **Service Integration**:
   - Services can be injected into other modules
   - Cross-module dependencies work correctly
   - Error handling propagates properly

4. **API Integration**:
   - Endpoints are accessible through the module
   - Request/response flow works end-to-end
   - Swagger documentation is generated correctly

5. **Error Handling**:
   - Module-level error handling works
   - Database errors are properly caught
   - HTTP exceptions are formatted correctly

## Additional Configuration Files

### Package.json updates (if needed)
```json
{
  "scripts": {
    "test:payment-schemes": "jest --testPathPattern=payment-scheme",
    "test:integration:payment-schemes": "jest --testPathPattern=payment-scheme.*integration"
  }
}
```

### Environment Configuration
```typescript
// Ensure database configuration supports payment schemes
// This should already be configured in existing database.config.ts
```

## Documentation Updates
- Update API documentation to include payment scheme endpoints
- Add module documentation to project README
- Include payment scheme examples in API documentation
- Update architecture diagrams to show payment scheme module

## Deployment Considerations
- Ensure migration files are included in deployment
- Verify module dependencies are satisfied in production
- Test module loading in production-like environment
- Monitor module initialization performance
