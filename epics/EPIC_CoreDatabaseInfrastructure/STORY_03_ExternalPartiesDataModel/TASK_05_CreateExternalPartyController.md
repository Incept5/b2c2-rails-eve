---
type: "task"
task_id: "TASK_05_CreateExternalPartyController"
story_id: "STORY_03_ExternalPartiesDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "todo"
---

# Task 5: Create External Party Controller

## Task Title
Implement External Party REST API Controller with Comprehensive Endpoints

## Detailed Description
Create the ExternalPartyController class following the established controller pattern from LegalEntityController. This controller will expose comprehensive REST API endpoints for external party management including CRUD operations, KYC status management, compliance filtering, and specialized endpoints for different party types. Include proper Swagger documentation, error handling, and response formatting.

## Technical Approach / Implementation Plan

### 1. Controller Architecture Design
- Create ExternalPartyController class in `backend/src/modules/legal-entity/controllers/`
- Follow established patterns from LegalEntityController
- Implement comprehensive REST API endpoints
- Add specialized KYC management endpoints
- Include compliance and reporting endpoints

### 2. API Endpoint Structure
- **Standard CRUD**: GET, POST, PUT, DELETE for external parties
- **KYC Management**: Dedicated endpoints for KYC status updates
- **Filtering**: Advanced filtering by type, jurisdiction, KYC status
- **Compliance**: Specialized endpoints for compliance reporting
- **Bulk Operations**: Administrative bulk update capabilities

### 3. Response and Error Handling
- Consistent response DTO mapping
- Comprehensive error handling with proper HTTP status codes
- Service exception to HTTP exception mapping
- Standardized error response format

### 4. Documentation and Validation
- Complete Swagger/OpenAPI documentation
- Request/response DTO validation
- Parameter validation and sanitization
- Example responses for all endpoints

## File Paths to Read
- `backend/src/modules/legal-entity/controllers/legal-entity.controller.ts` - Primary pattern reference
- `backend/src/modules/legal-entity/controllers/payment-scheme.controller.ts` - Additional pattern reference
- `backend/src/modules/legal-entity/dto/` - DTO pattern references

## Relevant Code Snippets

### Controller Class Structure
```typescript
@ApiTags('External Parties')
@Controller('api/external-parties')
export class ExternalPartyController {
  constructor(private readonly externalPartyService: ExternalPartyService) {}

  @ApiOperation({ 
    summary: 'Create a new external party',
    description: 'Creates external party with automatic KYC status assignment and compliance validation'
  })
  @ApiResponse({ status: 201, type: ExternalPartyResponseDto })
  @Public()
  @Post()
  async createParty(@Body() createDto: CreateExternalPartyDto): Promise<ExternalPartyResponseDto>;

  @ApiOperation({ 
    summary: 'List external parties with filtering',
    description: 'Retrieves paginated external parties with filtering by type, jurisdiction, and KYC status'
  })
  @Public()
  @Get()
  async findParties(@Query() queryDto: QueryExternalPartiesDto): Promise<PaginatedExternalPartiesResponseDto>;

  @ApiOperation({ 
    summary: 'Update external party KYC status',
    description: 'Updates KYC status with workflow validation and audit trail'
  })
  @Public()
  @Put(':id/kyc-status')
  async updateKycStatus(
    @Param('id') id: string, 
    @Body() updateDto: UpdateKycStatusDto
  ): Promise<ExternalPartyResponseDto>;
}
```

### Error Handling Implementation
```typescript
private handleServiceError(error: any): never {
  if (error instanceof PartyNotFoundException) {
    throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  }
  
  if (error instanceof DuplicatePartyException) {
    throw new HttpException(error.message, HttpStatus.CONFLICT);
  }
  
  if (error instanceof InvalidKycTransitionException) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
  
  if (error instanceof ComplianceViolationException) {
    throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
  
  if (error instanceof ValidationException) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }

  // Generic error fallback
  throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
}
```

### Response DTO Mapping
```typescript
private mapToResponseDto(party: ExternalParty): ExternalPartyResponseDto {
  return {
    externalId: party.id,
    name: party.name,
    type: party.type,
    jurisdiction: party.jurisdiction,
    kycStatus: party.kycStatus,
    relationshipStart: party.relationshipStart,
    notes: party.notes,
    createdAt: party.createdAt,
    updatedAt: party.updatedAt
  };
}
```

## API Endpoint Details

### Core CRUD Endpoints
- **POST /api/external-parties** - Create external party
- **GET /api/external-parties** - List with filtering and pagination
- **GET /api/external-parties/:id** - Get specific party
- **PUT /api/external-parties/:id** - Update party details
- **DELETE /api/external-parties/:id** - Delete party

### KYC Management Endpoints
- **PUT /api/external-parties/:id/kyc-status** - Update KYC status
- **GET /api/external-parties/kyc-review** - Get parties requiring review
- **POST /api/external-parties/:id/flag-review** - Flag party for review

### Filtering and Compliance Endpoints
- **GET /api/external-parties/by-type/:type** - Filter by party type
- **GET /api/external-parties/by-jurisdiction/:jurisdiction** - Filter by jurisdiction
- **GET /api/external-parties/compliance-report** - Generate compliance report

## Database Schema Changes
None - this task creates API layer over existing service and repository.

## Libraries/Dependencies
- **NestJS decorators**: Controller, API documentation, validation
- **class-validator**: DTO validation
- **Swagger decorators**: API documentation
- **ExternalPartyService**: Service layer dependency

## Potential Challenges and Solutions

### Challenge 1: Complex Query Parameter Handling
**Issue**: Managing multiple filter combinations in query parameters
**Solution**: Use comprehensive DTO validation and flexible filtering logic

### Challenge 2: KYC Status Update Security
**Issue**: Ensuring proper authorization for KYC status changes
**Solution**: Implement proper validation and prepare for future role-based access control

### Challenge 3: Error Response Consistency
**Issue**: Maintaining consistent error response format across all endpoints
**Solution**: Centralized error handling with standardized error response structure

### Challenge 4: API Documentation Completeness
**Issue**: Providing comprehensive API documentation for complex workflows
**Solution**: Detailed Swagger annotations with examples and clear descriptions

## Test Cases to Consider

### Endpoint Testing
1. **CRUD Operations**: Test all CRUD endpoints with valid and invalid data
2. **KYC Workflows**: Test KYC status update endpoints with various scenarios
3. **Filtering**: Test all filtering combinations and edge cases
4. **Pagination**: Test pagination with different page sizes and cursors

### Error Handling Testing
1. **Validation Errors**: Test input validation with invalid data
2. **Business Logic Errors**: Test business rule violations
3. **Not Found Scenarios**: Test handling of non-existent resources
4. **Server Errors**: Test error handling for unexpected scenarios

### Integration Testing
1. **Service Integration**: Test controller-service interaction
2. **Response Mapping**: Test DTO mapping accuracy
3. **Error Propagation**: Test error handling from service layer
4. **Documentation**: Test API documentation accuracy

### Security and Performance Testing
1. **Input Sanitization**: Test against malicious input
2. **Rate Limiting**: Test API performance under load
3. **Response Time**: Test endpoint performance
4. **Data Validation**: Test comprehensive data validation

## Implementation Steps
1. Create ExternalPartyController class file
2. Implement core CRUD endpoints with proper validation
3. Add specialized KYC management endpoints
4. Create filtering and querying endpoints
5. Implement comprehensive error handling
6. Add Swagger documentation for all endpoints
7. Create response DTO mapping methods
8. Implement proper HTTP status code handling
9. Add request validation and sanitization
10. Test all endpoints with comprehensive scenarios
11. Validate API documentation accuracy and completeness
12. Verify error handling and response consistency
