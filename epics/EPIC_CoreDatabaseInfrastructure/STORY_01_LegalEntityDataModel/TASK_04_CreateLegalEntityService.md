---
type: "task"
task_id: "TASK_04_CreateLegalEntityService"
story_id: "STORY_01_LegalEntityDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "completed"
---

# Task 4: Create Legal Entity Service

## Task Title
Implement business logic service for legal entity operations

## Detailed Description
Create a service class that implements business logic for legal entity operations including validation, capability management, hierarchy validation, and orchestrating repository operations. The service acts as the business layer between controllers and repositories.

## Technical Approach / Implementation Plan

1. **Create Service File**: Create legal-entity.service.ts in services directory
2. **Implement Business Logic**: Entity validation, capability setting, hierarchy checks
3. **Add CRUD Orchestration**: Wrap repository calls with business rules
4. **Implement Capability Logic**: Set default capabilities based on entity type
5. **Add Hierarchy Validation**: Prevent circular references, validate parent-child rules
6. **Add Error Handling**: Business-specific error messages and validation
7. **Generate ULIDs**: Auto-generate entity IDs using ULID library

## File Paths to Read
- `backend/src/modules/auth/services/user.service.ts` - Reference existing service pattern
- `backend/src/modules/auth/services/auth.service.ts` - Business logic patterns
- `epics/EPIC_CoreDatabaseInfrastructure/STORY_01_LegalEntityDataModel/TASK_03_CreateLegalEntityRepository.md` - Repository interface
- `epics/EPIC_CoreDatabaseInfrastructure/STORY_01_LegalEntityDataModel/STORY_01_LegalEntityDataModel.md` - Business rules

## Relevant Code Snippets
```typescript
// Based on existing service patterns
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(userData: CreateUserDto): Promise<User> {
    // Business logic and validation
    return this.userRepository.create(userData);
  }
}

// ULID generation pattern
import { ulid } from 'ulid';

const entityId = ulid();
```

## API Endpoint Details
N/A - Service layer, used by controllers

## Database Schema Changes
N/A - Uses existing repository layer

## Libraries/Dependencies
- @nestjs/common (Injectable decorator)
- ulid (for ID generation) - may need to install
- LegalEntityRepository (from Task 3)
- LegalEntity entity and enums (from Task 2)

## Business Logic to Implement

### Entity Creation Logic
- Generate ULID for new entities
- Set default capabilities based on entity type:
  - Banks: can_host_accounts = true, others false
  - Exchanges/Custodians: can_host_wallets = true, others false  
  - FX Providers: can_host_fx_nodes = true, others false
  - Branches: inherit capabilities from parent
- Validate parent entity exists for branch types
- Prevent circular parent-child references

### Entity Type Capabilities
```typescript
const DEFAULT_CAPABILITIES = {
  [LegalEntityType.BANK]: {
    can_host_accounts: true,
    can_host_wallets: false,
    can_host_fx_nodes: false
  },
  [LegalEntityType.EXCHANGER]: {
    can_host_accounts: false,
    can_host_wallets: true,
    can_host_fx_nodes: false
  },
  [LegalEntityType.CUSTODIAN]: {
    can_host_accounts: false,
    can_host_wallets: true,
    can_host_fx_nodes: false
  },
  [LegalEntityType.FX_PROVIDER]: {
    can_host_accounts: false,
    can_host_wallets: false,
    can_host_fx_nodes: true
  },
  [LegalEntityType.PAYMENT_PROVIDER]: {
    can_host_accounts: true,
    can_host_wallets: false,
    can_host_fx_nodes: false
  },
  [LegalEntityType.BRANCH]: {
    // Inherit from parent
  }
};
```

### Service Methods to Implement
- `createEntity(createDto: CreateLegalEntityDto): Promise<LegalEntity>`
- `findById(entityId: string): Promise<LegalEntity>`
- `updateEntity(entityId: string, updateDto: UpdateLegalEntityDto): Promise<LegalEntity>`
- `deleteEntity(entityId: string): Promise<void>`
- `findEntities(filters: EntityFilters): Promise<PaginatedResult<LegalEntity>>`
- `validateHierarchy(entityId: string, parentEntityId: string): Promise<boolean>`
- `setDefaultCapabilities(entityType: LegalEntityType, parentEntity?: LegalEntity): Capabilities`
- `getEntityHierarchy(entityId: string): Promise<LegalEntity[]>`

## Potential Challenges and Solutions
- **Challenge**: Complex hierarchy validation for circular references
  - **Solution**: Implement recursive parent chain validation
- **Challenge**: Capability inheritance for branch entities
  - **Solution**: Lookup parent capabilities when creating branches
- **Challenge**: Timezone validation
  - **Solution**: Use timezone validation library or predefined list
- **Challenge**: Country code validation
  - **Solution**: Use ISO 3166-1 alpha-2 validation
- **Challenge**: Preventing deletion of entities with dependencies
  - **Solution**: Check for dependent asset nodes before allowing deletion

## Validation Rules
- Entity name must be unique within country
- Branch entities must have a parent entity
- Parent entity must exist and be accessible
- No circular parent-child references allowed
- Entity type must be valid enum value
- Country code must be valid ISO 3166-1 alpha-2
- Timezone must be valid timezone identifier

## Error Handling
- EntityNotFoundException for missing entities
- InvalidHierarchyException for circular references
- DuplicateEntityException for name/country conflicts
- DependentEntitiesException when trying to delete entities with dependencies
- ValidationException for invalid input data

## Test Cases to Consider
- Create entity with valid data sets correct capabilities
- Create branch entity inherits parent capabilities
- Hierarchy validation prevents circular references
- Entity name uniqueness within country is enforced
- Deletion is prevented when dependencies exist
- Timezone and country validation works correctly
- ULID generation creates unique IDs
- Error handling returns appropriate exceptions
- Pagination and filtering work correctly
