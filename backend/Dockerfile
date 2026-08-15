FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Run migrations and start
CMD ["sh", "-c", "npm run migration:run && node dist/main"]