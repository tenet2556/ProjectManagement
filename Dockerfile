# ─────────────────────────────────────────────
# Stage 1: Install dependencies & build
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install system deps needed by Prisma / bcrypt
RUN apk add --no-cache libc6-compat openssl

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy Prisma schema so we can generate the client
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the source
COPY . .

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Production runner (slim)
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only what's needed for production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files (engine + schema needed at runtime)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# The prisma migrate command also needs the prisma CLI
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run database migrations then start the server
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
