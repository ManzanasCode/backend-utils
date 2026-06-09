# Stage 1: builder
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies for sharp compilation on Alpine
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

COPY src ./src

# Compile TypeScript
RUN npm run build

# Install only production dependencies
RUN npm ci --omit=dev

# Stage 2: production
FROM node:20-alpine AS production

# Install native vips-dev dependency required at runtime for Sharp
RUN apk add --no-cache vips-dev

# Create non-root user and group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /usr/src/app

# Copy production artifacts from builder
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/package.json ./package.json

USER nodejs

# Environment variables
ENV NODE_ENV=production PORT=3000

EXPOSE 3000

# Healthcheck to verify the server is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
