# syntax=docker/dockerfile:1

# ── Base ──────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

# ── Dependencies ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY --link package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# ── Build ─────────────────────────────────────────────────────────────────────
FROM base AS builder

# NEXT_PUBLIC_* variables are inlined at build time — all others are runtime.
# Provide runtime secrets via environment variables at container start, not here.
ARG APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=$APP_URL

# Runtime env stubs — Next.js needs these present to complete the build even
# though their real values come from the container environment at startup.
# The Spring Boot API URL and JWT secret must be set at runtime.
ENV SPRING_BOOT_API_URL=http://localhost:8080

COPY --link --from=deps /app/node_modules ./node_modules
COPY --link . .

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm run postinstall && pnpm run build

# ── Production runner ─────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

LABEL org.opencontainers.image.title="freesolo-web" \
      org.opencontainers.image.source="https://github.com/usmhic/freesolo" \
      org.opencontainers.image.description="FreeSolo web app (Next.js)" \
      org.opencontainers.image.authors="usmhic" \
      org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN apk add --no-cache curl \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 --ingroup nodejs nextjs

# Next.js standalone output
COPY --link --from=builder /app/public ./public
COPY --link --from=builder --chown=1001:1001 /app/.next/standalone ./
COPY --link --from=builder --chown=1001:1001 /app/.next/static     ./.next/static

# Runtime environment variables (inject via -e or docker-compose env_file):
#   SPRING_BOOT_API_URL   — internal URL of the Spring Boot API (e.g. http://api:8080)
#   JWT_SECRET            — must match the API's JWT_SECRET
#   NEXT_PUBLIC_APP_URL   — public canonical URL of this web app

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:3000/ -o /dev/null || exit 1

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
