# ----- Stage 1: Build -----
FROM node:18-alpine AS builder

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

WORKDIR /app

# Copy built files and production dependencies from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --production

# Expose the port your app will run on (default Remix port is 3000, but check your project)
EXPOSE 3000

# Define environment variables if needed (e.g., NODE_ENV)
ENV NODE_ENV=production

# Start the Remix app (assuming your start script runs remix-serve)
CMD [ "npm", "run", "start" ]
