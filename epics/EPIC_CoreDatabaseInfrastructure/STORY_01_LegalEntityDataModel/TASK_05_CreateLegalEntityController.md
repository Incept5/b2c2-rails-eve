---
type: "task"
task_id: "TASK_05_CreateLegalEntityController"
story_id: "STORY_01_LegalEntityDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "completed"
---

# Task 5: Create Legal Entity REST Controller

## Task Title
Implement REST API controller for legal entity management endpoints

## Detailed Description
Create a NestJS controller that exposes REST API endpoints for legal entity CRUD operations, filtering, and querying. The controller should include proper validation, error handling, Swagger documentation, and follow RESTful conventions.

## Technical Approach / Implementation Plan

1. **Create Controller File**: Create legal-entity.controller.ts in controllers directory
2. **Define REST Endpoints**: Implement standard CRUD endpoints with proper HTTP methods
3. **Add Request Validation**: Create and use DTOs for request validation
4. **Implement Response DTOs**: Create response DTOs for consistent API responses
5. **Add Swagger Documentation**: Document all endpoints with OpenAPI specifications
6. **Add Error Handling**: Handle service exceptions and return appropriate HTTP status codes
7. **Implement Filtering**: Support query parameters for filtering and pagination

## File Paths to Read
- `backend/src/modules/auth/controllers/users.controller.ts` - Reference existing controller pattern
- `backend/src/modules/auth/controllers/auth.controller.ts` - Controller patterns
- `backend/src/modules/auth/dto/signup.dto.ts` - DTO patterns
- `epics/EPIC_CoreDatabaseInfrastructure/STORY_01_LegalEntityDataModel/TASK_04_CreateLegalEntityService.md` - Service interface
- `epics/EPIC_CoreDatabaseInfrastructure/STORY_01_LegalEntityDataModel/STORY_01_LegalEntityDataModel.md` - API requirements

## Relevant Code Snippets
```typescript
// Based on existing controller patterns
@Controller('api/users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get()
  async findByEmail(@Query('email') email: string) {
    // Controller logic
  }
}

// DTO validation pattern
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;
}
```

## API Endpoint Details

### Endpoint Specifications
- `POST /api/legal-entities` - Create new legal entity
- `GET /api/legal-entities` - List legal entities with filtering and pagination
- `GET /api/legal-entities/:id` - Get specific legal entity by ID
- `PUT /api/legal-entities/:id` - Update legal entity
- `DELETE /api/legal-entities/:id` - Delete legal entity
- `GET /api/legal-entities/:id/children` - Get child entities

### Request/Response Examples
```typescript
// POST /api/legal-entities
{
  "name": "Example Bank Ltd",
  "country": "US", 
  "entityType": "bank",
  "timezone": "America/New_York",
  "regulatoryScope": "Federal",
  "parentEntityId": null
}

// Response 201 Created
{
  "entityId": "01H5EXAMPLE1234567890",
  "name": "Example Bank Ltd",
  "country": "US",
  "entityType": "bank", 
  "timezone": "America/New_York",
  "regulatoryScope": "Federal",
  "parentEntityId": null,
  "canHostAccounts": true,
  "canHostWallets": false,
  "canHostFxNodes": false,
  "createdAt": "2025-02-06T10:00:00Z",
  "updatedAt": "2025-02-06T10:00:00Z"
}

// GET /api/legal-entities?country=US&entityType=bank&page=1&limit=10
{
  "data": [...],
  "pagination": {
    "hasNext": false,
    "nextCursor": null,
    "totalCount": 5
  }
}
```

## Database Schema Changes
N/A - Uses existing service layer

## Libraries/Dependencies
- @nestjs/common (Controller, Get, Post, etc.)
- @nestjs/swagger (ApiTags, ApiOperation, etc.)
- class-validator (validation decorators)
- class-transformer (transformation decorators)
- LegalEntityService (from Task 4)

## DTOs to Create

### Request DTOs
```typescript
// create-legal-entity.dto.ts
export class CreateLegalEntityDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @Matches(/^[A-Z]{2}$/) // ISO 3166-1 alpha-2
  country: string;

  @IsEnum(LegalEntityType)
  entityType: LegalEntityType;

  @IsNotEmpty()
  @IsString()
  timezone: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  regulatoryScope?: string;

  @IsOptional()
  @IsUUID()
  parentEntityId?: string;
}

// update-legal-entity.dto.ts
export class UpdateLegalEntityDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  country?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  regulatoryScope?: string;
}

// query-legal-entities.dto.ts
export class QueryLegalEntitiesDto {
  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  country?: string;

  @IsOptional()
  @IsEnum(LegalEntityType)
  entityType?: LegalEntityType;

  @IsOptional()
  @IsUUID()
  parentEntityId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
```

### Response DTOs
```typescript
// legal-entity-response.dto.ts
export class LegalEntityResponseDto {
  entityId: string;
  name: string;
  country: string;
  entityType: LegalEntityType;
  timezone: string;
  regulatoryScope?: string;
  parentEntityId?: string;
  canHostAccounts: boolean;
  canHostWallets: boolean;
  canHostFxNodes: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// paginated-legal-entities-response.dto.ts
export class PaginatedLegalEntitiesResponseDto {
  data: LegalEntityResponseDto[];
  pagination: {
    hasNext: boolean;
    nextCursor?: string;
    totalCount?: number;
  };
}
```

## Controller Methods to Implement
- `createEntity(@Body() createDto: CreateLegalEntityDto): Promise<LegalEntityResponseDto>`
- `findEntities(@Query() queryDto: QueryLegalEntitiesDto): Promise<PaginatedLegalEntitiesResponseDto>`
- `findById(@Param('id') id: string): Promise<LegalEntityResponseDto>`
- `updateEntity(@Param('id') id: string, @Body() updateDto: UpdateLegalEntityDto): Promise<LegalEntityResponseDto>`
- `deleteEntity(@Param('id') id: string): Promise<void>`
- `findChildren(@Param('id') id: string): Promise<LegalEntityResponseDto[]>`

## Potential Challenges and Solutions
- **Challenge**: Complex validation for entity type and capabilities
  - **Solution**: Use custom validation decorators or validation in service layer
- **Challenge**: Proper error handling and HTTP status codes
  - **Solution**: Use NestJS exception filters and custom exceptions
- **Challenge**: Swagger documentation for complex DTOs
  - **Solution**: Use detailed ApiProperty decorators with examples
- **Challenge**: Pagination cursor handling
  - **Solution**: Use query parameters and proper response structure

## Error Handling
- 400 Bad Request for validation errors
- 404 Not Found for missing entities
- 409 Conflict for duplicate name/country combinations
- 422 Unprocessable Entity for business rule violations
- 500 Internal Server Error for unexpected errors

## Swagger Documentation
```typescript
@ApiTags('Legal Entities')
@Controller('api/legal-entities')
export class LegalEntityController {

  @ApiOperation({ summary: 'Create a new legal entity' })
  @ApiResponse({ status: 201, description: 'Legal entity created successfully', type: LegalEntityResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Entity already exists' })
  @Post()
  async createEntity(@Body() createDto: CreateLegalEntityDto): Promise<LegalEntityResponseDto> {
    // Implementation
  }
}
```

## Test Cases to Consider
- Create entity with valid data returns 201
- Create entity with invalid data returns 400
- Create duplicate entity returns 409
- Get entity by ID returns correct entity
- Get non-existent entity returns 404
- Update entity with valid data updates correctly
- Delete entity removes entity
- Delete entity with dependencies returns error
- Query entities with filters returns filtered results
- Pagination works correctly
- Swagger documentation is complete and accurate
