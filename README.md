
# B2C2 Rails Graph Modeling Tool

A sophisticated graph modeling application for visualizing and managing B2C2's payment network infrastructure. This tool models bank accounts, crypto wallets, FX venues, and payment methods as a connected graph, enabling path discovery, network analysis, and payment route optimization for modeling purposes.

## Project Overview

The B2C2 Rails Graph Modeling Tool is designed to represent complex payment networks as an interactive graph where:
- **Nodes** represent accounts (bank accounts, crypto wallets) and FX venues
- **Edges** represent payment methods connecting these accounts
- **Path Discovery** algorithms find optimal routes between source and destination accounts
- **Visual Interface** provides intuitive graph management and visualization

### Key Features

- **Graph Database**: Comprehensive data model for payment network entities
- **Interactive Visualization**: Web-based graph visualization with filtering and search
- **Path Discovery**: Advanced algorithms for finding payment routes with constraints
- **Network Analysis**: Tools for understanding payment network topology
- **Reference Data Management**: Centralized management of currencies, countries, and schemes

## Tech Stack

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL with JSON support for complex data structures
- **ORM**: Knex.js for migrations and query building
- **Authentication**: JWT with Passport.js
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest for E2E testing

### Frontend
- **Framework**: React with TypeScript
- **UI Components**: Shadcn UI with Tailwind CSS
- **Graph Visualization**: D3.js for interactive network diagrams
- **State Management**: React Context and custom hooks
- **Internationalization**: i18next for English/French support
- **Build Tool**: Vite for fast development and builds

## Core Data Models

The application models the payment network using these core entities:

### Nodes
- **Legal Entities**: Banks, exchangers, payment providers, custodians
- **Asset Nodes**: Bank accounts and crypto wallets (internal and external)
- **FX Nodes**: Foreign exchange venues for currency conversion

### Edges
- **Payment Methods**: Connections between accounts defining available payment routes
- **Payment Schemes**: Templates defining rules, fees, and constraints (SEPA, SWIFT, crypto networks)

### Reference Data
- **External Parties**: Clients, providers, employees who own external accounts
- **Configuration**: Currencies, countries, validation rules

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (preferred package manager)
- PostgreSQL (v14 or higher)
- Docker (for containerized PostgreSQL)

### Development Setup

1. **Clone and Setup**:
```bash
git clone <repository-url>
cd b2c2-rails-eve
```

2. **Environment Configuration**:
```bash
cp .env.example .env
# Edit .env with your database credentials and configuration
```

3. **Development Mode (Recommended)**:

   **Terminal 1** - Backend with database and hot reload:
   ```bash
   ./buildAndDev.sh
   ```

   **Terminal 2** - Frontend with hot reload:
   ```bash
   ./frontendDev.sh
   ```

   This provides:
   - Backend API with hot reload on http://localhost:3000/api
   - Frontend development server on http://localhost:5001
   - PostgreSQL database running in Docker
   - Automatic database migrations on startup

4. **Production Mode**:
   ```bash
   ./start.sh
   ```

### Application URLs

- **Frontend**: http://localhost:5001 (development) / http://localhost:3000 (production)
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api/docs
- **Database**: PostgreSQL on localhost:5432 (containerized)

## Project Structure

```
├── backend/                    # NestJS backend application
│   ├── src/
│   │   ├── modules/           # Feature modules (auth, database, etc.)
│   │   ├── migrations/        # Database migration files
│   │   └── config/           # Configuration files
│   └── test/                 # E2E tests
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── lib/            # Utilities and services
│   │   └── types/          # TypeScript type definitions
├── epics/                    # Product requirements and development tracking
│   └── EPIC_CoreDatabaseInfrastructure/  # Database implementation epic
└── plans/                   # Project planning documents
```

## Development Workflow

### Epic-Driven Development

This project follows an Epic → Story → Task workflow managed in the `epics/` directory:

- **Epics**: High-level feature sets (e.g., Core Database Infrastructure)
- **Stories**: User-focused requirements with acceptance criteria
- **Tasks**: Implementation-specific work items

Current development is focused on **Epic 1: Core Database Infrastructure**, establishing the foundational data models for the payment network graph.

### Database Development

- **Migrations**: Located in `backend/src/migrations/`
- **Auto-migration**: Migrations run automatically on application startup
- **Cross-database**: Compatible with both PostgreSQL (production) and SQLite (testing)
- **Naming**: Use timestamp prefixes: `YYYYMMDDHHMMSS_description.ts`

### API Development

- **Module Structure**: Each feature has its own module in `backend/src/modules/`
- **API Prefix**: All endpoints use `/api` prefix
- **Documentation**: Swagger docs auto-generated from decorators
- **Validation**: TypeScript DTOs with class-validator
- **Testing**: E2E tests in `backend/test/`

### Frontend Development

- **Component Organization**: Feature-based structure in `frontend/src/components/`
- **Styling**: Tailwind CSS with shadcn/ui components
- **Type Safety**: Full TypeScript integration with backend DTOs
- **Internationalization**: English and French translations required
- **Theme System**: Centralized theme management in `lib/theme.ts`

## Available Scripts

### Development Scripts
- `./buildAndDev.sh` - Start backend with database and hot reload
- `./frontendDev.sh` - Start frontend development server
- `./test.sh` - Run all tests
- `./build.sh` - Build both frontend and backend

### Production Scripts
- `./start.sh` - Start the complete application
- `./stop.sh` - Stop all services
- `./restart.sh` - Restart the application
- `./buildAndRestart.sh` - Build and restart

### Utility Scripts
- `./testAndRestart.sh` - Run tests and restart if successful
- `./stopDb.sh` - Stop only the database container

## Current Development Status

### ✅ Completed
- Project foundation and development environment
- Authentication system with JWT
- Database infrastructure with PostgreSQL
- Basic frontend structure with React + TypeScript
- Development workflow and scripts

### 🚧 In Progress (Epic 1: Core Database Infrastructure)
- Legal Entity data model implementation
- Payment Scheme data model
- External Parties data model
- Asset Nodes (accounts/wallets) data model
- FX Nodes data model
- Payment Methods (edges) data model

### 📋 Planned
- Reference data management APIs
- Web-based management interface
- Interactive graph visualization
- Path discovery algorithms
- Advanced filtering and search
- Audit logging and administration

## Testing

### Backend Testing
```bash
cd backend
pnpm run test:e2e        # Run E2E tests
pnpm run test:cov        # Run with coverage
```

### Frontend Testing
```bash
cd frontend
pnpm run test           # Run component tests
```

## Contributing

### Code Standards
- **TypeScript**: Strict mode enabled, full type coverage required
- **Linting**: ESLint + Prettier for consistent formatting
- **Testing**: E2E tests for critical workflows, unit tests for utilities
- **Documentation**: Swagger for APIs, JSDoc for complex functions
- **Commits**: Conventional commit messages preferred

### Development Guidelines
- Follow the Epic → Story → Task workflow in `epics/`
- Always read existing code before implementing new features
- Use shadcn/ui components for consistent styling
- Implement proper error handling and loading states
- Add translations for both English and French
- Update API documentation for all new endpoints

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Project Type**: Payment Network Graph Modeling Tool  
**Domain**: Financial Technology / Payment Processing  
**Architecture**: Full-stack web application with graph database  
**Status**: Active Development (Epic 1: Core Database Infrastructure)
