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

RUN npm ci --only=production && npm install tsconfig-paths

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

# ✅ Copy migrations to the correct location
COPY --from=builder /app/src/database/migrations ./dist/database/migrations

EXPOSE 3000

# ✅ Run migrations on startup
CMD ["sh", "-c", "npm run migration:run && node dist/main"]