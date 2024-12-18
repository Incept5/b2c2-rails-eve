# Full Stack Starter Project

A modern, full stack application starter template built with NestJS, React, TypeScript, and SQLite/PostgreSQL.

## Tech Stack

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **Authentication**: JWT with Passport.js
- **Database**: 
  - Development: SQLite
  - Production: PostgreSQL
- **ORM**: Knex.js
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React (Create React App) with TypeScript
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Build Tool**: Craco (Create React App Configuration Override)

## Prerequisites

- Node.js (v16 or higher)
- pnpm (preferred package manager)
- PostgreSQL (for production)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd fullstack-starter
```

2. Start the server:

```bash
./start.sh
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api
- Swagger Documentation: http://localhost:3000/api/docs

## Development

### Backend Development

- All new features should be organized in modules under `backend/src/modules/`
- Follow the existing module structure:
  ```
  modules/feature-name/
  ├── controllers/
  ├── services/
  ├── dto/
  ├── entities/
  └── feature-name.module.ts
  ```
- Use TypeScript DTOs for request/response validation
- Add Swagger documentation for all new endpoints
- Write e2e tests for new features

### Frontend Development

- Components should be placed in `frontend/src/components/`
- Use Tailwind CSS for styling
- Follow the existing component structure and styling patterns
- Utilize Shadcn UI components when possible

### Database Migrations

- Migrations are automatically run on application startup
- Create new migrations in `backend/src/migrations/`
- Use timestamp-prefixed names: `YYYYMMDDHHMMSS_description.ts`
- Ensure migrations are compatible with both SQLite and PostgreSQL

## Testing

### Backend Tests
```bash
cd backend

# Run e2e tests
pnpm run test:e2e

# Run test coverage
pnpm run test:cov
```

### Frontend Tests
```bash
cd frontend
pnpm run test
```

## Scripts

The project includes several utility scripts in the root directory:

- `./start.sh` - Start the application
- `./stop.sh` - Stop the application
- `./restart.sh` - Restart the application
- `./build.sh` - Build both frontend and backend
- `./test.sh` - Run all tests
- `./buildAndRestart.sh` - Build and restart the application
- `./testAndRestart.sh` - Run tests and restart if successful

## License

This project is licensed under the MIT License.