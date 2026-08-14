# Architecture

This document explains *why* FreeSolo is organized the way it is. For *how* to work inside a
specific app, see its nested README (`api/README.md`, `web/README.md`, `mobile/README.md`).

## Overview

```
Browser / Mobile app
        │
        │  HTTPS
        ▼
┌───────────────────┐
│   Next.js (web)   │   :3000
│   - Public pages  │
│   - Admin UI      │─────────────── proxies /api/** ──────────────▶  Spring Boot (api)  :8080
│   - JWT cookie    │                                                  - REST API
└───────────────────┘                                                  - Auth (JWT + OAuth)
                                                                       - Stripe payments
Mobile (Expo)  ──────────────────── Bearer token ────────────────────▶ - MinIO uploads
                                                                       - Resend email
                                                                       - PostgreSQL
```

- **`api/`** is the single source of truth for data, auth, and business logic — a Spring Boot
  REST API backed by PostgreSQL via Spring Data JPA. It issues JWTs, integrates Stripe for
  payments, and stores uploads in MinIO/S3.
- **`web/`** does not talk to the database directly. It **proxies** `/api/**` requests to the
  Spring Boot API and verifies the JWT cookie locally (using the same `JWT_SECRET` as the API) to
  avoid a network round-trip on every request. Server components and the admin UI still call the
  API over HTTP for data.
- **`mobile/`** calls the Spring Boot API directly with a Bearer token — there's no proxy layer on
  the mobile side since there's no browser cookie to manage.

## Modular monolith and schemas

The API is one deployable and one public contract, but its database is divided
into domain-owned schemas: `identity`, `partners`, `experiences`, `bookings`,
`billing`, `engagement`, and `media`. The ownership and allowed dependency
direction are defined in [`api/MODULES.md`](./api/MODULES.md).

Controllers expose the unified `/api/**` surface. Domain services communicate
in-process, so cross-domain work can remain transactional without internal HTTP
calls. Cross-schema foreign keys preserve integrity and make module dependencies
visible. A module can later be extracted behind a service/event contract without
changing how clients reach the API.

## Directory purposes

| Directory | Responsibility |
|---|---|
| `api/src/main/java/com/freesolo/api/config/` | Spring configuration — security, CORS, beans |
| `api/src/main/java/com/freesolo/api/module/` | Schema constants and the module ownership/dependency catalog |
| `api/src/main/java/com/freesolo/api/controller/` | REST controllers — request/response mapping |
| `api/src/main/java/com/freesolo/api/dto/` | Request/response records exposed at the API boundary |
| `api/src/main/java/com/freesolo/api/entity/` | JPA entities — the schema |
| `api/src/main/java/com/freesolo/api/repository/` | Spring Data JPA repositories |
| `api/src/main/java/com/freesolo/api/security/` | JWT issuance/validation, auth filter, principal |
| `api/src/main/java/com/freesolo/api/service/` | Business logic |
| `api/src/main/resources/application.yml` | Configuration, populated from environment variables |
| `web/app/(home)/` | Public landing and marketing pages |
| `web/app/admin/` | Admin dashboard (server components, calls the API with elevated auth) |
| `web/app/docs/` | Fumadocs help center — end-user documentation, not developer docs |
| `web/lib/` | API client, auth helpers, admin guards |
| `mobile/src/screens/` | App screens |
| `mobile/src/lib/` | Typed API client, auth, navigation helpers |
| `ARCHITECTURE.md` | This file — engineering-facing architecture documentation |

## Data flow

1. A client (web via proxy, or mobile directly) calls a Spring Boot REST endpoint.
2. The controller layer validates the request, delegates to a service, which uses a repository to
   read/write via JPA.
3. The web app additionally verifies the JWT cookie itself (shared-secret HMAC check) before
   proxying, so it can redirect unauthenticated users without waiting on the API.
4. File uploads and Stripe webhooks are handled entirely on the API side; the web app never talks
   to MinIO or Stripe directly.

## Database startup

On every boot, before any Spring-managed `DataSource` bean is created,
`api/src/main/java/com/freesolo/api/config/DatabaseCreator.java` (an
`ApplicationListener<ApplicationEnvironmentPreparedEvent>`) opens a plain JDBC connection to
Postgres's `postgres` maintenance database, checks `pg_database` for the target database, and
issues `CREATE DATABASE` if it's missing. It's best-effort — any failure (missing privileges, a
managed host with no `postgres` maintenance DB) is logged and swallowed so the real connection
error surfaces normally afterward instead of masking it.

Once the database exists, Flyway (`spring.flyway.enabled=true`,
`api/src/main/resources/db/migration/`) applies the modular baseline, tracked in its own
history table. The baseline creates a fresh database or transfers legacy `public.fs_*` tables
to their domain schemas without recreating their data. Hibernate is deliberately configured
with `ddl-auto: validate` (not `update`/`create`), so it only checks the schema matches entity
mappings and fails fast on drift rather than silently altering the schema itself.

## Key design decisions

- **API-owns-everything**: the database schema, auth, and business rules live in one Spring Boot
  service so web and mobile clients stay thin and swappable.
- **Schema-per-domain**: modules own explicit PostgreSQL schemas while the unified
  API retains simple in-process transactions and one deployment.
- **Web-side JWT verification**: rather than round-tripping to the API on every request just to
  check "is this user logged in," the web app verifies the JWT locally with the same `JWT_SECRET`
  that Compose supplies to the API.
- **Environment-variable configuration**: required local configuration lives in the repository-root
  `.env`; `.env.example` is the only committed template. Optional integration settings are injected
  by the deployment platform and mapped through `application.yml`.
