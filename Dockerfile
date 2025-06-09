# Stage 1: Builder - Install dependencies and build the application
# Using a specific version is better for reproducibility
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files and install dependencies
# This leverages Docker's layer caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
# This will generate the .next/standalone directory
RUN pnpm build


# Stage 2: Runner - Create the final, small production image
FROM node:24-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./

# Copy the public and static folders
# Next.js recommends this for the standalone output to work correctly
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app will run on
EXPOSE 3000

# Set the command to start the server
# The server.js file is created by the 'standalone' output mode
CMD ["node", "server.js"]