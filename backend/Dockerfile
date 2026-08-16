FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

RUN npm ci

COPY src ./src

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Install production dependencies AND tsconfig-paths
RUN npm ci --only=production && npm install tsconfig-paths

# Copy built app
COPY --from=builder /app/dist ./dist

# Copy the entire src directory (for migrations and config files)
COPY --from=builder /app/src ./src

EXPOSE 3000

# Run migrations using the dist path, then start
CMD ["sh", "-c", "npm run migration:run && node dist/main"]