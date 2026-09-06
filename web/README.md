# FreeSolo — Next.js Web App

**Next.js 16 App Router · TypeScript · Tailwind CSS 4 · Fumadocs**

The web front-end for the FreeSolo platform. Serves the public landing page, the Fumadocs-powered help center, and the admin / business-owner dashboard. All data access goes through the Spring Boot REST API — the web layer has no direct database connection.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Auth | JWT cookie verified via `jose` — issued by the Spring Boot API |
| API calls | Fetch-based `apiGet/apiPost/apiPatch/apiDelete` in `lib/api-client.ts` |
| API proxy | Next.js rewrites — `/api/**` → Spring Boot at `SPRING_BOOT_API_URL` |
| Docs | Fumadocs MDX at `/docs` |
| UI | Tailwind CSS 4 · lucide-react |

## Setup

The supported full-stack setup is run from the repository root:

```bash
cp .env.example .env
docker compose up --build web
```

For native web work, run `pnpm install` and `pnpm dev` with `SPRING_BOOT_API_URL` and `JWT_SECRET` exported by your shell.

The Spring Boot API must be running at `SPRING_BOOT_API_URL`.

### Required environment variables

| Variable | Description |
|---|---|
| `SPRING_BOOT_API_URL` | URL of the Spring Boot API |
| `JWT_SECRET` | **Must match** the API's `JWT_SECRET` — used to verify the auth cookie locally |

The shared values used by Compose are documented in the root `.env.example`.

## How authentication works

1. The user signs in via `/admin/sign-in`, which calls `POST /api/auth/otp/verify` (or an OAuth callback).
2. Spring Boot issues a `freesolo-token` HttpOnly cookie containing a signed JWT.
3. Server components (`lib/auth.ts`) read and verify that cookie using `jose` and the shared `JWT_SECRET`.
4. Server actions (`lib/api-client.ts`) forward the token to Spring Boot in the `Authorization: Bearer` header.
5. Browser requests to `/api/**` are proxied by Next.js rewrites, so cookies pass through automatically.

## How the API proxy works

`next.config.mjs` rewrites `/api/:path*` → `${SPRING_BOOT_API_URL}/api/:path*`.

This means the browser never needs to know the Spring Boot URL, CORS is transparent, and HttpOnly cookies work seamlessly across both layers.

## Routes

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/docs` | Fumadocs help center |
| `/admin/sign-in` | OTP + OAuth sign-in |
| `/admin` | Admin dashboard |
| `/admin/applications` | Host application review |
| `/admin/businesses` | Business management |
| `/admin/experiences` | Experience management |
| `/admin/bookings` | Booking management |
| `/admin/reviews` | Review moderation |
| `/admin/payouts` | Payout processing |
| `/admin/users` | User management |
| `/admin/marketing` | Email campaign management |
| `/admin/media` | Media / upload management |

All `/api/**` requests are proxied to the Spring Boot API.

## Help center (Fumadocs)

MDX files live in `content/docs/`. Nav order is set in `content/docs/meta.json`.

To add a new article:
1. Create `content/docs/your-article.mdx` with `title` and `description` frontmatter
2. Add the slug to `meta.json`

## Scripts

```bash
pnpm dev           # start dev server
pnpm build         # production build
pnpm start         # start production server
pnpm lint          # ESLint
pnpm types:check   # tsc --noEmit + Fumadocs type gen
```

## Docker

```bash
# Build (NEXT_PUBLIC_APP_URL is inlined at build time)
docker build --build-arg APP_URL=https://freesolo.app -t freesolo-web .

# Run (supply runtime secrets via environment)
docker run -p 3000:3000 \
  -e SPRING_BOOT_API_URL=http://api:8080 \
  -e JWT_SECRET=your-shared-secret-here \
  freesolo-web
```

Or use `docker compose up` from the root of the monorepo.

## Project layout

```
web/
├── app/
│   ├── (home)/           Public landing page
│   ├── admin/
│   │   ├── sign-in/      OTP + OAuth sign-in page
│   │   ├── (dashboard)/  Admin / business dashboard pages
│   │   └── _components/  Shared dashboard UI
│   └── docs/             Fumadocs help center
├── lib/
│   ├── api-client.ts     Server-side fetch wrapper (injects JWT header)
│   ├── auth.ts           JWT cookie verification via jose
│   ├── admin.ts          requireAdmin / requireDashboardUser guards
│   └── marketing.ts      Segment metadata for email campaign UI
├── content/docs/         MDX help-center articles
└── components/           Shared React components
```
