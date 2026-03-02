# ---- Base image ----
FROM node:20-alpine AS base
ENV NODE_ENV=production
# Ensure a consistent working directory
WORKDIR /app

# ---- Dependencies layer (to leverage caching) ----
FROM base AS deps
# libc6-compat fixes some native module issues on Alpine
RUN apk add --no-cache libc6-compat

# Copy lockfiles and package manifests only (better cache hit rate)
# Supports npm/yarn/pnpm; keep only what you actually use.
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install dependencies (npm here, switch to your preferred manager if needed)
# If using npm:
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
  else echo "No lockfile found. Consider checking one in for reproducible builds." && npm i; \
  fi

# ---- Builder ----
FROM base AS builder
# Dev tools for Prisma generation if needed
RUN apk add --no-cache openssl

# Copy installed node_modules from deps
COPY --from=deps /app/node_modules ./node_modules
# Copy app source
COPY . .

# Generate Prisma Client (needs schema + node_modules)
# If your schema is not under ./prisma/schema.prisma, adjust path
RUN npx prisma generate

# Build Next.js (standalone reduces image size)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Runner (production image) ----
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Create a non-root user (the official node image already has `node`)
USER node

# Copy the standalone server and static assets
# .next/standalone contains a minimal Node server + required files
COPY --chown=node:node --from=builder /app/.next/standalone ./ 
COPY --chown=node:node --from=builder /app/.next/static ./ .next/static
# If you have public assets
COPY --chown=node:node --from=builder /app/public ./public

# Prisma: copy schema (optional but useful if you run migrations inside the container)
COPY --chown=node:node --from=builder /app/prisma ./prisma

# Prisma engines required at runtime (sometimes needed when using standalone)
# These come from node_modules after `prisma generate`
COPY --chown=node:node --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=node:node --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Expose Next.js default port
EXPOSE 3000

# Start the Next.js server
# The standalone server is already set to run from server.js
CMD ["node", "server.js"]