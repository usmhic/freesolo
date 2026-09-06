# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- A documented modular API architecture with schema ownership for identity,
  partners, experiences, bookings, billing, engagement, and media.
- Shared engineering standards, coding-agent guidance, Dependabot configuration,
  and a private security-reporting path.
- Initial public documentation pass: `LICENSE`, `CODE_OF_CONDUCT.md`, issue/PR
  templates, `ARCHITECTURE.md`.

### Changed

- Added a documented package-naming contract for Java packages, Maven coordinates, JavaScript app names, and Android identifiers.
- Standardized the Android application ID to `com.osascloud.freesolo` for Google Play releases.
- Replaced the API migration history with one multi-schema baseline that creates
  fresh databases and moves legacy `public` tables without dropping their data.
- Consolidated environment configuration into a single root `.env.example`
  and `.gitignore`, replacing the per-service copies that previously lived
  under `api/`, `web/`, and `mobile/`.
- Aligned package, web, container, Compose, documentation, and workflow metadata
  with the usmhic open-source ecosystem.

### Fixed

- `mobile-ci.yml` type-check step no longer silently no-ops — `mobile/package.json`
  now has a real `types:check` script.

## [0.1.0] - 2026-07-18

### Added

- Spring Boot 4 REST API, Next.js 16 web app, and Expo mobile app.

[Unreleased]: https://github.com/usmhic/freesolo/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/usmhic/freesolo/releases/tag/v0.1.0
