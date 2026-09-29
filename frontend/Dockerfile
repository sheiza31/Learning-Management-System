# ============================================
# Stage 1: Install deps & build the app
# ============================================
FROM docker.io/library/node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Vite bakes VITE_* env vars at build time, so we need them as build args
ARG VITE_API_URL=http://localhost:8080/api/v1
ARG VITE_API_BASE_URL=http://localhost:8080/api/v1
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the production bundle (outputs to build/client/ for SPA mode)
RUN npm run build

# ============================================
# Stage 2: Production runtime (static file server)
# ============================================
FROM docker.io/library/node:22-alpine AS runner

# Install 'serve' globally to host the static SPA
RUN npm install -g serve

WORKDIR /app

# Copy static build output from builder
COPY --from=builder /app/build/client ./public

# Expose the serve port
EXPOSE 3000

# Serve the SPA with client-side routing fallback (-s flag)
CMD ["serve", "-s", "public", "-l", "3000"]
