<div align="center">

# 🧗 FreeSolo

### Solo travel, together.

**Small-group local experiences, hosted by people who actually live there.**
No big-bus tours. No stranger-danger group chats. Just a handful of people
sharing a pottery morning, a food crawl, or a sunrise hike — with a host who
knows exactly where to go.

<br />

[![Live demo](https://img.shields.io/badge/▶_Live_demo-freesolo.osas.cloud-C4A882?style=for-the-badge&labelColor=0D0D0D)](https://freesolo.osas.cloud)
[![API](https://img.shields.io/badge/⚙_Live_API-api.freesolo.osas.cloud-C4A882?style=for-the-badge&labelColor=0D0D0D)](https://api.freesolo.osas.cloud)
[![Docs](https://img.shields.io/badge/📖_Help_center-Read_the_docs-C4A882?style=for-the-badge&labelColor=0D0D0D)](https://freesolo.osas.cloud/docs)

[![iOS](https://img.shields.io/badge/iOS-Coming_soon-0D0D0D?style=for-the-badge&logo=apple&logoColor=white)](#mobile-apps)
[![Android](https://img.shields.io/badge/Android-Coming_soon-0D0D0D?style=for-the-badge&logo=android&logoColor=white)](#mobile-apps)

<br />

[![API CI](https://github.com/usmhic/freesolo/actions/workflows/api-ci.yml/badge.svg)](https://github.com/usmhic/freesolo/actions/workflows/api-ci.yml)
[![Web CI](https://github.com/usmhic/freesolo/actions/workflows/web-ci.yml/badge.svg)](https://github.com/usmhic/freesolo/actions/workflows/web-ci.yml)
[![Android CI](https://github.com/usmhic/freesolo/actions/workflows/mobile-android-dev.yml/badge.svg)](https://github.com/usmhic/freesolo/actions/workflows/mobile-android-dev.yml)
[![iOS CI](https://github.com/usmhic/freesolo/actions/workflows/mobile-ios-release.yml/badge.svg)](https://github.com/usmhic/freesolo/actions/workflows/mobile-ios-release.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

<sub>Java 21 · Spring Boot · Next.js · Expo · PostgreSQL · MinIO · one <code>docker compose up</code></sub>

</div>

---

## 🎬 Try the demo

| Where | Link | What you'll see |
|---|---|---|
| 🌍 **Web app** | **[freesolo.osas.cloud](https://freesolo.osas.cloud)** | The public site, the experience feed, and the booking flow |
| ⚙️ **API** | **[api.freesolo.osas.cloud](https://api.freesolo.osas.cloud)** | The live Spring Boot API the web and mobile clients talk to |
| 📖 **Help center** | **[freesolo.osas.cloud/docs](https://freesolo.osas.cloud/docs)** | End-user guides: joining, exploring, booking, hosting, reviews |
| 🔐 **Admin** | [freesolo.osas.cloud/admin](https://freesolo.osas.cloud/admin) | Application review, bookings, and the Swagger API reference |

> 💡 **FreeSolo is invite-gated by design.** Joining starts with a short application that a real
> person reads — so every member has been looked at by a human. Running the stack locally makes
> you the admin (see [`ADMIN_EMAIL`](#-configuration)), which is the fastest way to click through
> the whole flow end to end.

## ✨ How it works, in one breath

1. **You apply** to join — about five minutes, reviewed by a human.
2. **You explore** a feed of small-group experiences in your city, or the one you're visiting.
3. **You reserve a seat.** The booking confirms once enough people join to make it happen.
4. **You go, you connect, you review.** And if you know your own city well — flip the script and host.

## 🗺️ What's inside

| | Surface | Highlights |
|---|---|---|
| 🌍 | **Web** | Public site, experience feed, booking flow, Fumadocs help center, OG image generation |
| 🔐 | **Admin** | Applications, businesses, experiences, bookings, reviews, users, media, marketing |
| 📱 | **Mobile** | Expo app with the feed, maps, bookings, notifications, and camera uploads |
| ⚙️ | **API** | Spring Boot REST API — sole owner of auth, business rules, and the PostgreSQL schema |
| 📦 | **Storage** | MinIO (S3-compatible) for every uploaded photo and document |

## 🧱 Tech stack

| Surface | Stack |
| --- | --- |
| API | Java 21, Spring Boot, Spring Security, Flyway, PostgreSQL |
| Web | Next.js, React, TypeScript, Fumadocs |
| Mobile | Expo and React Native |
| Storage | MinIO (S3-compatible) |
| Delivery | Docker Compose, GitHub Actions, GHCR |

## 🚀 Quick start

Docker Compose is the supported full-stack development path. It starts PostgreSQL, MinIO, the API,
and the web app, and creates the object-storage bucket automatically.

```bash
git clone https://github.com/usmhic/freesolo.git && cd freesolo
cp .env.example .env       # PowerShell: Copy-Item .env.example .env
# Fill the secrets marked FILL ME at the bottom of .env, then:
docker compose up --build
```

`.env.example` already carries working localhost defaults for everything that is not a secret, so
the only values you need to invent are the passwords and the JWT secret. `.env` is gitignored;
never commit it.

☕ Grab a coffee for the first build, then open:

| Service | URL |
|---|---|
| 🌍 Web | http://localhost:3000 |
| ❤️ API health | http://localhost:8080/actuator/health |
| 📦 MinIO console | http://localhost:9001 |
| 🐘 PostgreSQL | localhost:5432 |

Useful commands:

```bash
docker compose logs -f api web
docker compose down
docker compose down --volumes  # also deletes local database and uploads
```

## 🏛️ Architecture at a glance

```
Browser / Mobile app
        │  HTTPS
        ▼
┌───────────────────┐
│   Next.js (web)   │  :3000
│   Public + Admin  │──── proxies /api/** ────▶  Spring Boot (api)  :8080
│   JWT cookie      │                            REST · JWT + OAuth
└───────────────────┘                            MinIO · Resend · PostgreSQL
Mobile (Expo) ───────── Bearer token ─────────▶
```

The API is the single source of truth. The web app never touches the database directly — it
proxies `/api/**` and verifies the JWT cookie locally with the same `JWT_SECRET`. The mobile app
skips the proxy entirely and calls the API with a Bearer token.

Full breakdown in [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📁 Repository layout

| Path | Purpose |
|---|---|
| [`api/`](./api) | Java 21 and Spring Boot API; owns auth, business logic, and the PostgreSQL schema |
| [`web/`](./web) | Next.js web app and API proxy |
| [`mobile/`](./mobile) | Expo SDK 57 mobile client |
| [`docker-compose.yml`](./docker-compose.yml) | Complete local/deployment stack |
| [`.env.example`](./.env.example) | The only environment template |

## 🔧 Configuration

All Compose configuration lives in the ignored root `.env`. The tracked `.env.example` lists the
required variable names with intentionally empty values; fill the local copy before starting the
stack.

| Variable | Purpose |
|---|---|
| `APP_URL` | Public web URL and allowed browser origin |
| `API_URL` | Public API URL baked into the web `/api/**` proxy at build time (default `https://api.freesolo.osas.cloud`) |
| `STORAGE_URL` | Public MinIO URL returned for uploaded files |
| `ADMIN_EMAIL` | Email that receives the administrator role |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `MINIO_PASSWORD` | MinIO password shared with the API |
| `JWT_SECRET` | Signing secret shared by the API and web app |

⚠️ Change every password and secret before deployment. Optional Resend, OAuth, and Expo
integration variables are documented in [api/README.md](./api/README.md) and can be supplied by the
deployment platform without expanding the default local configuration.

## Mobile apps

<div align="center">

[![iOS](https://img.shields.io/badge/iOS-Coming_soon-0D0D0D?style=for-the-badge&logo=apple&logoColor=white)](#mobile-apps)
[![Android](https://img.shields.io/badge/Android-Coming_soon-0D0D0D?style=for-the-badge&logo=android&logoColor=white)](#mobile-apps)

</div>

📱 **The App Store and Play Store listings aren't live yet** — the Expo app is built and running,
and the delivery pipelines are wired up (see [MOBILE_DELIVERY.md](./MOBILE_DELIVERY.md)):
`dev` ships Android builds to testers via Firebase App Distribution, `main` uploads to both stores.
Until the listings go live, running it locally takes about a minute:

```bash
docker compose up -d db minio minio-init api   # backend in Compose
cd mobile && pnpm install && pnpm start        # app on your host
```

Scan the QR code with **Expo Go** and you're in. Set `EXPO_PUBLIC_API_URL` in your shell when a
simulator or physical device cannot reach `http://localhost:8080` — use the computer's LAN address
for a physical device. See [mobile/README.md](./mobile/README.md).

| | Identifier |
|---|---|
| 🍎 iOS bundle | `com.freesolo.app` |
| 🤖 Android package | `com.osascloud.freesolo` |

## 🌐 Deployment

Use production secrets in the deployment environment, set `APP_URL` to the public HTTPS URL, and run:

```bash
docker compose up -d --build
```

Place a TLS-terminating reverse proxy in front of the web service. Do not commit the production
`.env` or expose PostgreSQL/MinIO ports publicly; restrict those published ports in the deployment
platform or a production override.

## 🤖 CI/CD

| Workflow | Purpose |
| --- | --- |
| `api-ci.yml` | Maven verification, Compose validation, API image build/publish, and PR smoke test |
| `web-ci.yml` | Type-check, lint, web image build/publish, and PR smoke test |
| `mobile-android-dev.yml` | Type-check, signed APK, distribute to testers via Firebase App Distribution (`dev`) |
| `mobile-ios-dev.yml` | Signed Ad Hoc IPA, distribute to testers via Firebase App Distribution (manual) |
| `mobile-android-release.yml` | Signed AAB, upload to Google Play Console (`main`) |
| `mobile-ios-release.yml` | Signed IPA, upload to App Store Connect (`main`) |
| `release.yml` | Create a GitHub release from a `vX.Y.Z` tag |

Images are published as `ghcr.io/usmhic/freesolo-api` and `ghcr.io/usmhic/freesolo-web`, with
`latest`, `dev`, and immutable SHA tags where applicable.

## 📚 Documentation

| Doc | What's in it |
|---|---|
| [Architecture](./ARCHITECTURE.md) | Service boundaries, data flow, and directory purposes |
| [API guide](./api/README.md) | Spring Boot modules, migrations, and optional integrations |
| [Web guide](./web/README.md) | Next.js app, proxy layer, and the help center |
| [Mobile guide](./mobile/README.md) | Expo setup, device testing, and builds |
| [Mobile delivery](./MOBILE_DELIVERY.md) | How dev builds reach testers and release builds reach the stores |
| [Engineering standards](./STANDARDS.md) | Shared conventions across every usmhic project |
| [Package naming](./PACKAGE_NAMING.md) | Public package, namespace, and app identifiers |
| [Coding-agent guide](./AGENTS.md) | Repository map, commands, and guardrails |
| [Security policy](./SECURITY.md) | Private vulnerability reporting and deployment notes |

## 🤝 Contributing

Issues and pull requests are welcome — focused fixes, bold ideas, and thoughtful docs improvements
all count. Start with [CONTRIBUTING.md](./CONTRIBUTING.md) and follow the
[Code of Conduct](./CODE_OF_CONDUCT.md).

## 📄 License

[MIT](./LICENSE) © [usmhic](https://github.com/usmhic)

<div align="center"><sub>Built for people who travel alone but don't want to <em>be</em> alone. ⛰️</sub></div>
