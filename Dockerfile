# Multi-stage build for BlazeIoT Backend
FROM node:20-alpine AS backend-build

WORKDIR /app

# Copy backend package files
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY . .

# Build frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app/admin-dashboard

# Copy frontend package files
COPY admin-dashboard/package*.json ./
RUN npm ci

# Copy frontend source
COPY admin-dashboard/ ./

# Build frontend
RUN npm run build

# Final production image
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY --from=backend-build /app/src ./src
COPY --from=backend-build /app/server.js ./
COPY --from=backend-build /app/scripts ./scripts

# Copy built frontend
COPY --from=frontend-build /app/admin-dashboard/dist ./admin-dashboard/dist

# Create necessary directories
RUN mkdir -p logs uploads/firmware data

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
