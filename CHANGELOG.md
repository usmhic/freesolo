# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Multi-day group trips alongside single-session experiences. Trips carry a
  day-by-day itinerary and what the price covers, and don't need a venue.
- Host-approved joining: travelers ask to join with a short intro, and the host
  accepts or declines from the new Host tab. Requests hold no seat. A
  declined traveler can't re-request the same trip.
- "Who's going" on every listing, visible to signed-in members.
- Held seats confirm together once a listing reaches its minimum group size,
  with in-app, push, and email notice.
- `/api/hosting/**` endpoints for a host's listings, venues, and join requests.
- Group chat for every listing, open to the host and travelers holding a
  seat. Members get one notification when a quiet chat wakes up, not one per
  message.

- A documented modular API architecture with schema ownership for identity,
  partners, experiences, bookings, engagement, and media.
- Shared engineering standards, coding-agent guidance, Dependabot configuration,
  and a private security-reporting path.
- Initial public documentation pass: `LICENSE`, `CODE_OF_CONDUCT.md`, issue/PR
  templates, `ARCHITECTURE.md`.

### Changed

- Only approved members can join a listing, and groups cap at twelve
  travelers. Hosts can only list experiences at venues they own.
- The landing page and help center now lead with group trips.

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

- Filled seats now count booked seats, not bookings, so a two-seat booking no
  longer leaves room to oversell. Joining and approving lock the listing row
  so two travelers can't take the last seat at the same time.
- The mobile host form loads the member's venues from the API; it previously
  read a field `/api/users/me` never returned, so no venue ever appeared.
- The landing page no longer says cards are charged; FreeSolo doesn't take
  payment.

- `mobile-ci.yml` type-check step no longer silently no-ops — `mobile/package.json`
  now has a real `types:check` script.

## [0.1.0] - 2026-07-18

### Added

- Spring Boot 4 REST API, Next.js 16 web app, and Expo mobile app.

[Unreleased]: https://github.com/usmhic/freesolo/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/usmhic/freesolo/releases/tag/v0.1.0
