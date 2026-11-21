# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- FreeSolo becomes a history game for travelers. Tell it where you're
  travelling and for how long, and it turns the city into a walk of levels:
  short lessons tied to real places, each with a challenge you solve on the
  spot and a sourced story that unlocks when you do.
- Five cities to play — Tangier, Porto, Córdoba, Rotterdam and Salzburg — with
  33 researched levels (three free per city), each citing its sources.
- A simple game funnel: pick a city, set your days, and follow a winding path
  of levels next to the map; each win shows your next level, nudges you to the
  city pack once the free levels are done, and celebrates a finished city.
- Levels are visual: a photo of every place (veiled until you solve it, so it
  can't give the answer away), key facts as big chips, a short story you can
  expand or listen to, video links, and a postcard collection in My sky.
  Photos come from Wikimedia Commons, are served by the web app, and are
  credited on each photo and on a Photo credits page. Map pins now use
  Wikipedia's coordinates where an article has them.
- Answers are checked against each level's accepted answers; with
  `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` set, an AI model on OpenRouter
  also judges your own wording, other languages and photos, and nudges you
  when you're close.
- Every mission is worth points (✨ 100–250, a fifth less per hint), and a
  global ranking — all time and this week, with a podium — shows who's lit
  up the most of the sky.
- Stardust and star ranks from Nebula to Black Hole, earned in any city and
  never sold, and "My sky": a night sky with a star for every solved level and
  a constellation per city.
- City packs unlock a city's remaining levels for good (free during the pilot).
  Free levels need no account; signed-out progress stays in the browser.
- A Help Center page on playing, and a game-first landing page. Group trips
  stay as the way to play together.
- The game speaks English, French, Spanish and Arabic. Pick a language in the
  header; the landing page, game screens and every city and mission follow it,
  and Arabic is laid out right to left with its own typeface. The API serves
  content in the language asked for (`?lang=` or `Accept-Language`), answers
  are accepted in any of the four, and the AI judge replies in the player's
  language.
- Game content is one JSON file per city and per mission, with a guide in
  `api/src/main/resources/play/README.md`. `node scripts/new-mission.mjs <city>
  <slug>` scaffolds a mission in all four languages, and the API refuses to
  start on incomplete content, naming the file and field to fix.

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

### Removed

- Leftover web helpers from the Prisma era (`lib/api.ts`, `lib/route-config.ts`)
  and a duplicate application form, plus unused API repository queries.

### Fixed

- The phone menu opens again: it was sized to the header while the header's
  background blur was on, so it never showed.
- Pages that aren't translated yet (trips, planner, applying, sign-in, legal,
  help center, admin) stay English and left to right when the site is in
  Arabic, instead of mirroring English text.
- Phone layouts: city and trip lists swipe sideways on the landing page, steps
  and reasons are compact rows, level titles on a city's path wrap instead of
  being cut off, the trip controls stack neatly, back links and buttons are
  easier to tap, and reopening a solved mission shows its story.
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
