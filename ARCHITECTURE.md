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
Mobile (Expo)  ──────────────────── Bearer token ────────────────────▶ - MinIO uploads
                                                                       - Resend email
                                                                       - PostgreSQL
```

- **`api/`** is the single source of truth for data, auth, and business logic — a Spring Boot
  REST API backed by PostgreSQL via Spring Data JPA. It issues JWTs and stores uploads in
  MinIO/S3.
- **`web/`** does not talk to the database directly. It **proxies** `/api/**` requests to the
  Spring Boot API and verifies the JWT cookie locally (using the same `JWT_SECRET` as the API) to
  avoid a network round-trip on every request. Server components and the admin UI still call the
  API over HTTP for data.
- **`mobile/`** calls the Spring Boot API directly with a Bearer token — there's no proxy layer on
  the mobile side since there's no browser cookie to manage.

## Repository structure

```
freesolo/
├── api/                              Spring Boot API — sole owner of the schema, auth, and rules
│   ├── pom.xml                       Maven build and dependency pins
│   ├── MODULES.md                    Module ↔ schema ownership and allowed dependencies
│   └── src/main/
│       ├── java/com/freesolo/api/
│       │   ├── FreeSoloApiApplication.java   Spring Boot entry point
│       │   ├── config/               Security, CORS, OpenAPI, AppProperties, DatabaseCreator
│       │   ├── module/               DomainSchemas + ModuleCatalog — the ownership map in code
│       │   ├── controller/           REST controllers — request/response mapping only
│       │   ├── dto/                  Request/response records, grouped by domain
│       │   ├── entity/               JPA entities — the schema
│       │   ├── repository/           Spring Data JPA repositories
│       │   ├── service/              Business logic
│       │   ├── security/             JWT issuance/validation, auth filter, principal
│       │   └── exception/            ApiException and the global handler
│       └── resources/
│           ├── application.yml       Non-secret defaults, populated from env vars
│           └── db/migration/         Flyway migrations (V1 is the modular baseline)
│
├── web/                              Next.js App Router — public site, admin UI, API proxy
│   ├── app/
│   │   ├── (home)/                   Landing, privacy, terms
│   │   ├── admin/                    Admin dashboard + sign-in + server actions
│   │   │   └── (dashboard)/          applications, businesses, experiences, bookings,
│   │   │                             reviews, users, media, marketing, api-docs
│   │   ├── docs/                     Fumadocs help center (end-user, not developer docs)
│   │   └── og/                       Open Graph image generation
│   ├── content/docs/                 MDX source for the help center
│   ├── lib/                          API client, auth + admin guards, route config, validation
│   └── components/                   Shared UI
│
├── mobile/                           Expo app — calls the API directly with a Bearer token
│   ├── App.tsx                       Root — AuthProvider + NavigationContainer
│   └── src/
│       ├── navigation/               Stack + bottom-tab navigators
│       ├── screens/                  auth/, traveler/, business/, shared/
│       ├── context/                  AuthContext — session, sign-in, sign-out
│       ├── lib/                      apiFetch() with Bearer injection, push registration
│       ├── components/               Shared native UI (Button, Card, Field, Chip…)
│       └── theme/                    Design tokens (colors, fonts, spacing)
│
├── docker-compose.yml                The full local stack: Postgres, MinIO, api, web
├── .env                              Local development values — gitignored, ready to run
├── .env.example                      The committed reference for every variable
├── ARCHITECTURE.md                   This file — how the system fits together and why
├── AGENTS.md                         Condensed working map for automated contributors
├── STANDARDS.md                      Repository-wide conventions
├── CONTRIBUTING.md                   How to set up, change, verify, and submit
└── PACKAGE_NAMING.md                 Naming rules for published artifacts
```

Three rules explain most of the layout:

1. **One owner per concern.** The schema, auth, and business rules live only in
   `api/`. `web/` and `mobile/` hold presentation and client-side state.
2. **A module owns a schema.** `module/DomainSchemas.java` names the schemas and
   `module/ModuleCatalog.java` records who may depend on whom — both are code, so
   they cannot drift silently from the documentation.
3. **Layers point inward.** `controller/` depends on `service/`, which depends on
   `repository/` and `entity/`. Nothing flows the other way.

## Modular monolith and schemas

The API is one deployable and one public contract, but its database is divided
into domain-owned schemas: `identity`, `partners`, `experiences`, `bookings`,
`engagement`, and `media`. The ownership and allowed dependency
direction are defined in [`api/MODULES.md`](./api/MODULES.md).

Controllers expose the unified `/api/**` surface. Domain services communicate
in-process, so cross-domain work can remain transactional without internal HTTP
calls. Cross-schema foreign keys preserve integrity and make module dependencies
visible. A module can later be extracted behind a service/event contract without
changing how clients reach the API.

## Data flow

1. A client (web via proxy, or mobile directly) calls a Spring Boot REST endpoint.
2. The controller layer validates the request, delegates to a service, which uses a repository to
   read/write via JPA.
3. The web app additionally verifies the JWT cookie itself (shared-secret HMAC check) before
   proxying, so it can redirect unauthenticated users without waiting on the API.
4. File uploads are handled entirely on the API side; the web app never talks to MinIO
   directly.

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
