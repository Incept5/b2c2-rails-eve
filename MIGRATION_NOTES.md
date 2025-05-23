# Migration from bcrypt and sqlite3 to PostgreSQL and Node.js crypto

## Changes Made

### 1. Removed Dependencies
- **bcrypt** - Replaced with Node.js built-in `crypto` module
- **sqlite3** - Replaced with PostgreSQL for all environments
- **@types/bcrypt** - No longer needed

### 2. Added PostgreSQL with Docker Compose
- Created `docker-compose.yml` with PostgreSQL 15
- Database: `fullstack_starter`
- Default credentials: `postgres/postgres`
- Port: `5432`

### 3. New Password Service
- Created `backend/src/modules/auth/services/password.service.ts`
- Uses `crypto.scrypt()` for secure password hashing
- Uses `crypto.timingSafeEqual()` for secure password verification
- No native compilation required

### 4. Updated Database Configuration
- All environments now use PostgreSQL
- Configurable via environment variables:
  - `DB_HOST` (default: localhost)
  - `DB_PORT` (default: 5432)
  - `DB_USER` (default: postgres)
  - `DB_PASSWORD` (default: postgres)
  - `DB_NAME` (default: fullstack_starter)

### 5. Updated Scripts
- `buildAndDev.sh` now starts PostgreSQL automatically
- Added `stopDb.sh` to stop the database container

## Getting Started

### Prerequisites
- Docker and Docker Compose installed

### Starting the Application
```bash
# This will start PostgreSQL and the backend in development mode
./buildAndDev.sh
```

### Stopping the Database
```bash
# Stop the PostgreSQL container
./stopDb.sh
```

### Manual Database Management
```bash
# Start PostgreSQL only
docker-compose up -d postgres

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs postgres

# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d fullstack_starter
```

## Environment Variables

Create a `.env` file in the backend directory if you need custom database settings:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=fullstack_starter
```

## Password Migration

If you have existing users with bcrypt-hashed passwords, they will need to reset their passwords as the new password service uses a different hashing format.

## Benefits

1. ✅ No native compilation issues on Apple Silicon
2. ✅ Consistent database across all environments
3. ✅ Secure password hashing with Node.js crypto
4. ✅ Easy database management with Docker
5. ✅ Production-ready PostgreSQL setup
