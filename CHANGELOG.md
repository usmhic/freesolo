# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Redesigned web app and landing page: a new navy and sunset brand, Plus
  Jakarta Sans headings, one shared header and footer, and layouts built for
  phones first. The trips list, trip pages, sign-in and application pages are
  all rebuilt.
- Route planner at `/planner`: search for places or click the map to add stops,
  reorder them, choose how you travel, split the journey into days, and see the
  distance and time for each leg and day. Signed-in members can save plans,
  and hosts can show a saved route on a trip they host.
- Trip pages on the web and in the app show the host's route on a map, with
  every stop and the leg before it.
- OpenRouteService routing and place search in the API (`/api/routing/**`),
  with per-client rate limits and caching. Without `ORS_API_KEY`, routes fall
  back to marked straight-line estimates and place search is switched off.
- Saved journey plans (`/api/plans`) in a new `planning` schema, and
  `PUT`/`DELETE /api/hosting/listings/{id}/route` to put a plan's route on a
  hosted trip.
- Configurable map tiles (`NEXT_PUBLIC_MAP_TILE_*`). The default is
  OpenStreetMap's public tiles.
- The mobile app uses the same brand colours, heading font and cover colours
  as the web.

- Public trip pages on the web: `/trips` to browse trips and experiences, and
  `/trips/[id]` with the itinerary, what's included, the host, how full the
  group is, and a sticky join bar on phones. The landing page shows live
  "Leaving soon" trips and its app mockups now show trips.
- Cover photos for listings: hosts can add one from the app; listings without
  one get a colour cover that matches between web and mobile.
- Mobile UI refresh: cover-first feed cards, a photo hero on the listing page,
  a button that reflects your status (request sent, you're going), group-size
  steppers, and self-formatting dates in the host form.

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

- Trimmed `.env.example` to the 25 keys a local setup needs, in clear groups.
  Values that only repeated an API default are gone, and each value now has
  one name: `STORAGE_URL` is now `MINIO_PUBLIC_URL`, and the native-run script
  derives `NEXT_PUBLIC_APP_URL`, `FRONTEND_URL` and `MINIO_SECRET_KEY`. Recreate
  your `.env` from the template.
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

- Admin listing dates entered as DD/MM/YYYY no longer show "Invalid Date" or
  swap the day and month.
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
