# ----- Stage 1: Build -----
FROM node:18-alpine AS builder

# Install dependencies required for native modules like argon2
RUN apk add --no-cache python3 make g++ gcc

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Set the Docker environment flag
ENV DOCKER_ENV=true

# Build the app
RUN npm run build

# ----- Stage 2: Production -----
FROM node:18-alpine AS runner

# Install runtime dependencies required for native modules
RUN apk add --no-cache python3 make g++ gcc postgresql-client

WORKDIR /app

# Copy built files and production dependencies from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/app/lib ./app/lib
COPY --from=builder /app/knexfile.ts ./knexfile.ts

# Set production port (default port will be set by server.js based on NODE_ENV)
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV DOCKER_ENV=true

# Expose both development and production ports
EXPOSE 6001 6000

# Start the app
CMD ["npm", "run", "prod:docker"]
