# ============================================
# Stage 1: Build the Go binary
# ============================================
FROM docker.io/library/golang:1.23-alpine AS builder

# Install git & ca-certs (needed for fetching modules & HTTPS)
RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copy go module files first for better layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build a statically-linked binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /app/lms-server ./cmd/main.go

# ============================================
# Stage 2: Minimal runtime image
# ============================================
FROM docker.io/library/alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy the compiled binary from builder
COPY --from=builder /app/lms-server .

# Expose the app port
EXPOSE 8080

# Run the server
CMD ["./lms-server"]
