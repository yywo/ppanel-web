FROM node:20-alpine AS base

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

COPY . .

# Install dependencies based on the preferred package manager
# Omit --production flag for TypeScript devDependencies
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --ignore-scripts; \
  # Allow install without lockfile, so example works even without Node.js installed locally
  else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
  fi

RUN npx turbo telemetry disable
RUN npx turbo build --filter=ppanel-user-web

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/user/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/user/.next/static ./apps/user/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/user/public ./apps/user/public

# Environment variables must be redefined at run time
# Uncomment the following line to disable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED=1

# Note: Don't expose ports here, Compose will handle that for us
CMD ["node", "apps/user/server.js"]