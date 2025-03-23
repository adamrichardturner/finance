# ----- Stage 1: Build -----
FROM node:18-alpine AS builder

# Install dependencies required for native modules like argon2
RUN apk add --no-cache python3 make g++ gcc

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first to leverage Docker cache
COPY package*.json ./

# Install dependencies (use --production=false to install all packages if you have devDependencies for building)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Remix app
RUN npm run build

# ----- Stage 2: Production -----
FROM node:18-alpine AS runner

# Install runtime dependencies required for native modules
RUN apk add --no-cache python3 make g++ gcc

WORKDIR /app

# Copy built files and production dependencies from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env ./.env

# Expose the port your app will run on (default Remix port is 3000, but check your project)
EXPOSE 3000

# Define environment variables (these will be overridden by docker-compose)
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DB_USER=finance
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_NAME=finance

# Start the Remix app (assuming your start script runs remix-serve)
CMD [ "npm", "run", "start" ]
