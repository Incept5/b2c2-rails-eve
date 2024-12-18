# Development Hints & Guidelines

## Backend Development

### Project Structure
- Use a modular approach with each unit of functionality in its own module
- All modules should be placed under `backend/src/modules`
- Example structure for a new feature:
  ```
  backend/src/modules/your-feature/
  ├── your-feature.controller.ts
  ├── your-feature.module.ts
  ├── your-feature.service.ts
  ├── dto/
  │   ├── create-something.dto.ts
  │   └── update-something.dto.ts
  └── entities/
      └── something.entity.ts
  ```

### API Design
- Follow API-first approach
- All endpoints must be prefixed with `/api`
- Use consistent JSON request/response payloads
- Implement pagination for list endpoints where appropriate
- Example endpoint structure:
  ```typescript
  // List endpoint with pagination
  GET /api/your-feature?page=1&limit=10
  
  // Get single item
  GET /api/your-feature/:id
  
  // Create new item
  POST /api/your-feature
  
  // Update item
  PUT /api/your-feature/:id
  
  // Delete item
  DELETE /api/your-feature/:id
  ```

### Testing
- Focus on simple end-to-end (e2e) tests for happy path scenarios (no unit tests required for now)
- Place e2e tests in `backend/test` directory
- Do not use fixtures or mocks in e2e tests - test the real API
- Example test structure:
  ```typescript
  describe('YourFeature (e2e)', () => {
    it('should create a new item', () => {
      // Test POST endpoint
    });

    it('should retrieve items with pagination', () => {
      // Test GET endpoint with pagination
    });
  });
  ```

### Best Practices
- Use TypeScript DTOs for request/response validation
- Implement proper error handling
- Follow existing code style and formatting
- Document API endpoints with clear descriptions
- Use meaningful variable and function names
- Keep modules focused and single-responsibility