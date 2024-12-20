# Multi-stage build for frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY frontend/ ./
RUN pnpm build

# Multi-stage build for backend
FROM node:20-alpine as backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY backend/ ./
RUN pnpm build

# Final stage
FROM node:20-alpine
WORKDIR /app

# Install SQLite
RUN apk add --no-cache sqlite

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy backend build and dependencies
COPY --from=backend-builder /app/backend/dist /app/backend/dist
COPY --from=backend-builder /app/backend/node_modules /app/backend/node_modules
COPY --from=backend-builder /app/backend/package.json /app/backend/

# Copy necessary scripts
COPY start.sh /app/
COPY stop.sh /app/
COPY restart.sh /app/

RUN chmod +x /app/*.sh

EXPOSE 3000 5173

CMD ["sh", "/app/start.sh"]