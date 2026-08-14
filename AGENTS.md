# Repository guide for coding agents

## Product

FreeSolo is an open-source platform for discovering and booking curated
solo-travel experiences, maintained by usmhic.

## Map

- `api`: Java 21 / Spring Boot modular API; owns auth, business logic, and schema.
- `api/src/main/java/com/freesolo/api/module`: domain schema catalog and module metadata.
- `web`: Next.js App Router client and server-side API proxy.
- `mobile`: Expo client. Read `mobile/AGENTS.md` before changing that tree.
- `docker-compose.yml`: supported local integration stack.

Read `ARCHITECTURE.md` before changing service boundaries.

## Commands

Use versions in `mise.toml`.

- Full stack: `docker compose up --build`
- API checks: `cd api && mvn clean verify -B`
- Web checks: `cd web && pnpm install --frozen-lockfile && pnpm run types:check && pnpm run lint && pnpm run build`
- Compose validation: `docker compose --no-interpolate config --quiet`

## Guardrails

- The API owns data and authentication; clients access it over HTTP.
- Flyway owns schema evolution. Keep Hibernate validation enabled.
- Put each new table in its owning domain schema and update `api/MODULES.md` when
  adding or changing a module boundary.
- Keep server-only values out of browser and Expo public variables.
- Do not edit generated Expo native directories.
- Update the root environment template and relevant README with configuration.
- Preserve focused framework-native tests and formatting.
