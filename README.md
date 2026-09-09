# FreeSolo

[![API](https://github.com/usmhic/freesolo/actions/workflows/api-ci.yml/badge.svg)](https://github.com/usmhic/freesolo/actions/workflows/api-ci.yml)
[![Web](https://github.com/usmhic/freesolo/actions/workflows/web-ci.yml/badge.svg)](https://github.com/usmhic/freesolo/actions/workflows/web-ci.yml)
[![Mobile](https://github.com/usmhic/freesolo/actions/workflows/mobile-ci.yml/badge.svg)](https://github.com/usmhic/freesolo/actions/workflows/mobile-ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

FreeSolo is a community-led platform for discovering and booking curated solo-travel experiences.

## Tech stack

| Surface | Stack |
| --- | --- |
| API | Java 21, Spring Boot, Spring Security, Flyway, PostgreSQL |
| Web | Next.js, React, TypeScript, Fumadocs |
| Mobile | Expo and React Native |
| Storage | MinIO (S3-compatible) |
| Delivery | Docker Compose, GitHub Actions, GHCR |

## Repository layout

| Path | Purpose |
|---|---|
| `api/` | Java 21 and Spring Boot API; owns auth, business logic, and the PostgreSQL schema |
| `web/` | Next.js web app and API proxy |
| `mobile/` | Expo SDK 57 mobile client |
| `docker-compose.yml` | Complete local/deployment stack |
| `.env.example` | The only environment template |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for service boundaries and data flow.

## Quick start

Docker Compose is the supported full-stack development path. It starts PostgreSQL, MinIO, the API, and the web app, and creates the object-storage bucket automatically.

```bash
cp .env.example .env
# Fill the secrets marked FILL ME at the bottom of .env, then start Compose.
docker compose up --build
```

On PowerShell, use `Copy-Item .env.example .env` for the first command.
`.env.example` already carries working localhost defaults for everything that
is not a secret, so the only values you need to invent are the passwords and the
JWT secret. `.env` is gitignored; never commit it.

| Service | URL |
|---|---|
| Web | http://localhost:3000 |
| API health | http://localhost:8080/actuator/health |
| MinIO console | http://localhost:9001 |
| PostgreSQL | localhost:5432 |

Useful commands:

```bash
docker compose logs -f api web
docker compose down
docker compose down --volumes  # also deletes local database and uploads
```

## Configuration

All Compose configuration lives in the ignored root `.env`. The tracked
`.env.example` lists the required variable names with intentionally empty
values; fill the local copy before starting the stack.

| Variable | Purpose |
|---|---|
| `APP_URL` | Public web URL and allowed browser origin |
| `API_URL` | Public API URL baked into the web `/api/**` proxy at build time (default `https://api.freesolo.osas.cloud`) |
| `STORAGE_URL` | Public MinIO URL returned for uploaded files |
| `ADMIN_EMAIL` | Email that receives the administrator role |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `MINIO_PASSWORD` | MinIO password shared with the API |
| `JWT_SECRET` | Signing secret shared by the API and web app |

Change every password and secret before deployment. Optional Resend, OAuth, and Expo integration variables are documented in [api/README.md](./api/README.md) and can be supplied by the deployment platform without expanding the default local configuration.

## Mobile development

The mobile app is interactive and runs on the host, while its backend runs in Compose:

```bash
docker compose up -d db minio minio-init api
cd mobile
pnpm install
pnpm start
```

Set `EXPO_PUBLIC_API_URL` in your shell when a simulator or physical device cannot reach `http://localhost:8080`; use the computer's LAN address for a physical device. See [mobile/README.md](./mobile/README.md).

## Deployment

Use production secrets in the deployment environment, set `APP_URL` to the public HTTPS URL, and run:

```bash
docker compose up -d --build
```

Place a TLS-terminating reverse proxy in front of the web service. Do not commit the production `.env` or expose PostgreSQL/MinIO ports publicly; restrict those published ports in the deployment platform or a production override.

## CI/CD

| Workflow | Purpose |
| --- | --- |
| `api-ci.yml` | Maven verification, Compose validation, API image build/publish, and PR smoke test |
| `web-ci.yml` | Type-check, lint, web image build/publish, and PR smoke test |
| `mobile-ci.yml` | Expo/TypeScript checks |
| `release.yml` | Create a GitHub release from a `vX.Y.Z` tag |

Images are published as `ghcr.io/usmhic/freesolo-api` and
`ghcr.io/usmhic/freesolo-web`, with `latest`, `dev`, and immutable SHA
tags where applicable.

## Documentation

- [Architecture](./ARCHITECTURE.md)
- [API guide](./api/README.md)
- [Web guide](./web/README.md)
- [Mobile guide](./mobile/README.md)
- [Engineering standards](./STANDARDS.md)
- [Package naming](./PACKAGE_NAMING.md) - public package, namespace, and app identifiers
- [Coding-agent guide](./AGENTS.md)
- [Security policy](./SECURITY.md)

## Contributing

Issues and pull requests are welcome. Start with [CONTRIBUTING.md](./CONTRIBUTING.md) and follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

[MIT](./LICENSE) © [usmhic](https://github.com/usmhic)
