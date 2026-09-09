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

# Both are consumed at BUILD time: Next.js bakes `rewrites()` into
# routes-manifest.json and inlines NEXT_PUBLIC_* into the client bundle, so
# supplying these only at runtime has no effect on either.
ARG SPRING_BOOT_API_URL=https://api.freesolo.osas.cloud
ARG APP_URL=https://freesolo.osas.cloud
ENV SPRING_BOOT_API_URL=${SPRING_BOOT_API_URL} \
    NEXT_PUBLIC_APP_URL=${APP_URL}

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

# SPRING_BOOT_API_URL here only serves server-side calls (lib/api-client.ts);
# override with -e to reach the API over an internal address, e.g.
# http://api:8080 inside Compose.
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    SPRING_BOOT_API_URL=https://api.freesolo.osas.cloud

RUN apk add --no-cache curl \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 --ingroup nodejs nextjs

# Next.js standalone output
COPY --link --from=builder /app/public ./public
COPY --link --from=builder --chown=1001:1001 /app/.next/standalone ./
COPY --link --from=builder --chown=1001:1001 /app/.next/static     ./.next/static

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:3000/ -o /dev/null || exit 1

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
