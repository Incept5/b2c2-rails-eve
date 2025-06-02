# Development Hints & Guidelines

## Frontend Development

### Project Structure
- All frontend code should be placed under `frontend/src`
- Components should be organized by feature or domain
- Reusable UI components should be placed in `frontend/src/components/ui`
- Follow this structure for new features:
  ```
  frontend/src/
  ├── pages/your-feature/
  │   └── index.tsx
  ├── components/your-feature/
  │   ├── feature-component.tsx
  │   └── sub-components/
  └── lib/your-feature/
      └── your-feature.service.ts
  ```

### API Integration
- The API is the source of truth - never modify the API to match the frontend, always update the frontend to match the API
- Always read the corresponding backend controller and DTO files before implementing API calls
- Use strongly typed request/response interfaces that match backend DTOs exactly
- Example API service structure:
  ```typescript
  interface CreateSomethingDto {
    // Copy types from backend DTO
  }

  export class YourFeatureService {
    async createSomething(dto: CreateSomethingDto) {
      return api.post('/api/your-feature', dto);
    }
  }
  ```

### Internationalization (i18n)
- All UI text must be added to translation files for both English and French
- Place translations in:
  - `frontend/src/i18n/locales/en/translation.json`
  - `frontend/src/i18n/locales/fr/translation.json`
- Use nested keys for feature-specific translations
- Example translation usage:
  ```typescript
  // In translation files:
  {
    "yourFeature": {
      "title": "Feature Title",
      "description": "Feature description"
    }
  }

  // In components:
  const { t } = useTranslation();
  <h1>{t('yourFeature.title')}</h1>
  ```

### Component Development
- Use shadcn/ui components from `components/ui` for consistent styling
- Implement responsive designs using Tailwind CSS
- Keep components focused and reusable
- Use TypeScript for all component props
- Always use the application theme from `lib/theme.ts` for styling
- Extend the theme when new design tokens are needed rather than using hardcoded values
- Use the getThemeClass utility for accessing theme values
- Example component structure:
  ```typescript
  interface FeatureProps {
    data: YourDataType;
    onAction: (id: string) => void;
  }

  export function FeatureComponent({ data, onAction }: FeatureProps) {
    const { t } = useTranslation();
    return (
      <Card className={getThemeClass('components.card.base')}>
        <CardHeader>
          <CardTitle className={getThemeClass('components.text.heading')}>
            {t('yourFeature.title')}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }
  ```

### Theme Usage
- The application theme is defined in `lib/theme.ts` and should be the single source of truth for styling
- Theme includes predefined tokens for:
  - Color schemes and gradients
  - Component-specific styles
  - Typography and text styles
  - Common UI patterns
- Always extend the theme instead of using arbitrary values:
  ```typescript
  // In lib/theme.ts
  export const theme = {
    // Existing theme configuration...
    components: {
      yourFeature: {
        container: 'bg-white/90 p-4 rounded-lg',
        header: 'text-lg font-semibold text-blue-600',
      }
    }
  }
  
  // In your component
  <div className={getThemeClass('components.yourFeature.container')}>
    <h2 className={getThemeClass('components.yourFeature.header')}>
      {t('yourFeature.title')}
    </h2>
  </div>
  ```
- When adding new theme values:
  1. First check if an existing theme token meets your needs
  2. If not, add new tokens to the appropriate theme section
  3. Use semantic naming that describes the purpose, not the appearance
  4. Document any new theme additions in comments

### State Management
- Use React Context for global state when needed
- Prefer local state for component-specific data
- Use custom hooks to encapsulate complex state logic
- Follow existing patterns in `lib/auth.context.tsx`

### Best Practices
- Follow existing code style and formatting
- Use meaningful component and variable names
- Keep components focused and single-responsibility
- Implement proper error handling and loading states
- Use TypeScript for type safety
- Add comments for complex logic
- Follow existing patterns for routing and layouts
- Use existing hooks from the `hooks` directory where applicable

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

### Examples

- See the auth module (controller, dtos etc) for examples of how to implement new REST endpoints being careful to follow the existing patterns for validation, error handling, documentation etc

### Testing
- Focus on simple end-to-end (e2e) tests for happy path scenarios (no unit tests required for now)
- Place e2e tests in `backend/test` directory
- Do not use fixtures or mocks in e2e tests - test the real API
- Use the rest-client.ts file to make requests to the API and use the test-auth.ts file to authenticate and get a test user
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

### Building and Testing
Assume the ./buildAndDev.sh script was already running and server is in hot reload mode
Also assume frontend is running in dev mode on port 5001

### Database Development
- The application uses Knex.js for database operations and migrations
- Database configuration is environment-based:
- PostgreSQL (localhost:5432 running locally in docker)
- Migrations must be compatible with both SQLite and PostgreSQL:
  - Avoid using database-specific features
  - Place migrations in `backend/src/migrations`
  - Use timestamp-prefixed names (YYYYMMDDHHMMSS_description.ts)
- Database connections are automatically:
  - Established on application startup
  - Migrations are run on startup
  - Connections are properly closed on shutdown

### Best Practices
- Use TypeScript DTOs for request/response validation
- Include Swagger documentation for all endpoints with the `@ApiTags` and `@ApiOperation` decorators and clear descriptions
- Implement proper error handling
- Follow existing code style and formatting
- Use both INFO and DEBUG logging levels as appropriate
- Use meaningful variable and function names
- Keep modules focused and single-responsibility
- All entity IDs should use ULIDs (Universally Unique Lexicographically Sortable Identifiers)
