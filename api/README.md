# FreeSolo — Spring Boot REST API

**Java 21 · Spring Boot 4.1 · Spring Security · Spring Data JPA · PostgreSQL**

The backend for the FreeSolo platform. Handles authentication, bookings, file uploads (MinIO), email (Resend), push notifications (Expo), and the admin API consumed by the Next.js web dashboard.

FreeSolo does not process payments. It reserves seats and confirms groups; travelers settle with the venue directly.

## Architecture

FreeSolo is a modular monolith: one deployable API and one public HTTP surface,
with each business domain owning a PostgreSQL schema. Domain code communicates
in-process through Spring services; clients never address a module or schema
directly. See [MODULES.md](MODULES.md) for ownership, dependencies, and migration
guidance.

## Stack

| Layer | Technology |
|---|---|
| Framework | Spring Boot 4.1 |
| Language | Java 21 |
| Auth | JWT (HS256) via JJWT · Google OAuth · Apple OAuth |
| Database | PostgreSQL · Spring Data JPA · Hibernate |
| Storage | MinIO (S3-compatible) |
| Email | Resend |
| Push notifications | Expo Push API |
| Build | Maven 3.9 |

## Quick start

From the repository root:

```bash
cp .env.example .env
# Fill every empty value in .env before starting Compose.
docker compose up --build api
```

For native API work, start `db`, `minio`, and `minio-init` with Compose, then run `mvn spring-boot:run` with the required variables exported by your shell.

### Required environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL JDBC URL — `jdbc:postgresql://localhost:5432/freesolo` |
| `JWT_SECRET` | 32+ char secret — `openssl rand -hex 32` — **shared with the web layer** |
| `ADMIN_EMAIL` | First user to sign up with this email is auto-promoted to admin |

The root `.env.example` contains only the variable names required by the default
Compose stack, with intentionally empty values. Optional integrations use
`RESEND_API_KEY`, `EMAIL_FROM`, `EXPO_ACCESS_TOKEN`, `GOOGLE_*`, and
`APPLE_*`; inject them through your deployment platform when enabling those
features. `application.yml` contains only non-secret defaults.

## API overview

All endpoints are under `/api/`. Authentication uses a JWT stored in an HttpOnly cookie (`freesolo-token`) for web clients and a `Bearer` token in the `Authorization` header for mobile clients.

### Auth — `/api/auth`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/otp/send` | Send sign-in OTP to email |
| `POST` | `/api/auth/otp/verify` | Verify OTP, issue JWT cookie |
| `POST` | `/api/auth/signout` | Clear the JWT cookie |
| `GET` | `/api/auth/oauth/{provider}/authorize` | Begin OAuth flow (Google, Apple) |
| `GET` | `/api/auth/oauth/callback` | OAuth callback — issue JWT cookie |

### Public — `/api/experiences`, `/api/applications`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/experiences` | Browse active experiences |
| `GET` | `/api/experiences/{id}` | Experience detail |
| `POST` | `/api/applications` | Submit a host application |

### Authenticated — `/api/bookings`, `/api/reviews`, `/api/uploads`, etc.

Require a valid JWT. See controllers for the full list.

### Admin — `/api/admin/**`

`GET` endpoints allow `ROLE_ADMIN` and `ROLE_BUSINESS` (business owners see only their own data). Mutating endpoints require `ROLE_ADMIN`.

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/actuator/health` | Spring Actuator health check |

## Development

```bash
mvn spring-boot:run          # run with hot-reload via DevTools
mvn verify                   # compile, test, package
mvn package -DskipTests      # build JAR without running tests
```

## Docker

```bash
# Build the image
docker build -t freesolo-api .

# Run (supply env vars at runtime — never bake secrets into the image)
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/freesolo \
  -e JWT_SECRET=your-secret-here \
  -e ADMIN_EMAIL=admin@example.com \
  freesolo-api
```

Or use `docker compose up` from the root of the monorepo.

## Architecture notes

- **JWT extraction**: The `JwtAuthFilter` reads the JWT from either the `freesolo-token` HttpOnly cookie (web) or the `Authorization: Bearer` header (mobile). This means the same API serves both clients transparently.
- **Business scope**: Business users (`ROLE_BUSINESS`) have a `businessId` claim baked into their JWT. Admin endpoints check this claim to filter data — no extra DB query per request.
- **Schema management**: Flyway (`db/migration`) owns the schema; Hibernate runs with `ddl-auto: validate` so it never mutates it. The target database itself is auto-created on startup if it doesn't exist yet (see `DatabaseCreator`).
- **N+1 queries**: Some admin-only endpoints use lazy-loaded JPA relationships. This is intentional — admin pages are low-traffic internal tools.
