# Multi-stage build for frontend
FROM node:23.3.0-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY frontend/ ./
RUN pnpm build

# Multi-stage build for backend
FROM node:23.3.0-alpine as backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY backend/ ./
RUN pnpm build

# Final stage
FROM node:23.3.0-alpine
WORKDIR /app

# Install SQLite and pnpm
RUN apk add --no-cache sqlite && \
    npm install -g pnpm

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy backend build and dependencies
COPY --from=backend-builder /app/backend/dist /app/backend/dist
COPY --from=backend-builder /app/backend/node_modules /app/backend/node_modules
COPY --from=backend-builder /app/backend/package.json /app/backend/

# Copy necessary scripts
COPY *.sh /app/

RUN chmod +x /app/*.sh

EXPOSE 3000 5173

CMD ["sh", "/app/startProd.sh"]