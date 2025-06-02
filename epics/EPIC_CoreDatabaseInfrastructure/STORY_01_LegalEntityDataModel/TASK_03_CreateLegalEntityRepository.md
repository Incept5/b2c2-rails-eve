---
type: "task"
task_id: "TASK_03_CreateLegalEntityRepository"
story_id: "STORY_01_LegalEntityDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "completed"
---

# Task 3: Create Legal Entity Repository

## Task Title
Implement repository pattern for legal entity data access operations

## Detailed Description
Create a repository class that handles all database operations for legal entities including CRUD operations, querying with filters, pagination support, and proper mapping between database rows and entity objects. The repository will follow the existing pattern from the user repository.

## Technical Approach / Implementation Plan

1. **Create Repository File**: Create legal-entity.repository.ts in repositories directory
2. **Implement CRUD Operations**: Create, read, update, delete operations
3. **Add Query Methods**: Filtering by country, type, parent entity
4. **Implement Pagination**: Cursor-based pagination for large datasets
5. **Add Mapping Methods**: Convert between database rows and entity objects
6. **Add Validation**: Ensure data integrity in repository operations

## File Paths to Read
- `backend/src/modules/auth/repositories/user.repository.ts` - Reference existing repository pattern
- `backend/src/modules/database/database.service.ts` - Database service interface
- `epics/EPIC_CoreDatabaseInfrastructure/STORY_01_LegalEntityDataModel/TASK_02_CreateLegalEntityEntity.md` - Entity definition

## Relevant Code Snippets
```typescript
// Based on existing user repository pattern
@Injectable()
export class UserRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(user: Partial<User>): Promise<User> {
    const [created] = await this.db.knex('users')
      .insert(this.mapToRow(user))
      .returning('*');
    return this.mapToEntity(created);
  }

  private mapToEntity(row: any): User {
    // Mapping logic
  }

  private mapToRow(entity: Partial<User>): any {
    // Mapping logic
  }
}
```

## API Endpoint Details
N/A - Repository layer, no direct API endpoints

## Database Schema Changes
N/A - Uses existing legal_entities table

## Libraries/Dependencies
- @nestjs/common (Injectable decorator)
- DatabaseService (already available)
- LegalEntity entity (from Task 2)

## Potential Challenges and Solutions
- **Challenge**: Complex hierarchical queries for parent-child relationships
  - **Solution**: Implement recursive CTE queries for tree traversal
- **Challenge**: Efficient pagination with large datasets
  - **Solution**: Use cursor-based pagination with entity_id
- **Challenge**: Filtering with multiple criteria
  - **Solution**: Build dynamic query conditions based on provided filters
- **Challenge**: Proper error handling for constraint violations
  - **Solution**: Catch and rethrow with meaningful error messages

## Repository Methods to Implement

### Core CRUD Operations
- `create(entity: Partial<LegalEntity>): Promise<LegalEntity>`
- `findById(entityId: string): Promise<LegalEntity | null>`
- `update(entityId: string, updates: Partial<LegalEntity>): Promise<LegalEntity>`
- `delete(entityId: string): Promise<void>`

### Query Operations
- `findAll(options?: QueryOptions): Promise<PaginatedResult<LegalEntity>>`
- `findByType(entityType: LegalEntityType, options?: QueryOptions): Promise<PaginatedResult<LegalEntity>>`
- `findByCountry(country: string, options?: QueryOptions): Promise<PaginatedResult<LegalEntity>>`
- `findByParent(parentEntityId: string): Promise<LegalEntity[]>`
- `findChildren(entityId: string): Promise<LegalEntity[]>`

### Validation Operations
- `existsById(entityId: string): Promise<boolean>`
- `hasDependentNodes(entityId: string): Promise<boolean>`
- `validateParentChild(entityId: string, parentEntityId: string): Promise<boolean>`

### Query Options Interface
```typescript
interface QueryOptions {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    hasNext: boolean;
    nextCursor?: string;
    totalCount?: number;
  };
}
```

## Test Cases to Consider
- Create legal entity with valid data
- Find entity by ID returns correct entity
- Update entity modifies correct fields
- Delete entity removes from database
- Find by type filters correctly
- Find by country filters correctly
- Pagination works with large datasets
- Parent-child relationships are handled correctly
- Validation methods return accurate results
- Error handling for constraint violations
- Mapping between entity and database row is accurate
