# Multi-stage build for production
FROM node:18-alpine AS builder

# Server build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
RUN npx prisma generate

# Client build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY --from=builder /app/server /app/server

# Copy built client files
COPY --from=builder /app/client/dist /app/client/dist

# Install PM2 for process management
RUN npm install -g pm2

# Expose ports
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \  
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["pm2-runtime", "server/server.js"]
