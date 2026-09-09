# API modules and database schemas

FreeSolo is a modular monolith: clients see one Spring Boot API, while each
business domain owns a PostgreSQL schema. This gives the codebase microservice-
style boundaries without adding network calls, distributed transactions, or
separate deployments before they are useful.

## Ownership map

| Module | PostgreSQL schema | Owned tables | Depends on |
|---|---|---|---|
| Identity | `identity` | `fs_users`, `fs_oauth_accounts`, `fs_otp_codes` | — |
| Partners | `partners` | `fs_businesses`, `fs_applications` | Identity |
| Experiences | `experiences` | `fs_experiences`, `fs_reviews` | Identity, Partners |
| Bookings | `bookings` | `fs_bookings` | Identity, Experiences |
| Engagement | `engagement` | `fs_notifications`, `fs_email_campaigns` | Identity |
| Media | `media` | `fs_uploads`, `fs_event_photos` | Identity, Experiences, Bookings |

`module/DomainSchemas.java` is the source of truth for schema names, and
`module/ModuleCatalog.java` is the machine-readable ownership/dependency map.
JPA entities declare their schema explicitly; there is no mutable default
schema or search-path dependency.

## Internal communication

- Controllers are the single HTTP boundary and keep the existing `/api/**`
  routes. Clients never address a module or schema directly.
- A module owns writes to its tables. Cross-domain workflows are coordinated by
  Spring services in-process and share one transaction when consistency matters.
- Modules depend in the direction shown above. New code should call a module's
  service rather than reaching through to another module's repository.
- Cross-schema foreign keys are intentional while the modules share one
  database. They protect data integrity and make a later service extraction an
  explicit design decision rather than an accidental split.
- Email, push, and object-storage adapters remain infrastructure behind
  the owning application service; they are not separate public APIs.

## Fresh baseline and existing data

`db/migration/V1__baseline_schema.sql` is the only maintained Flyway migration.
It creates the schemas and tables for a fresh database. If legacy tables exist
in `public`, the same migration moves them with `ALTER TABLE ... SET SCHEMA`,
which preserves rows, indexes, constraints, and identifiers.

For a database that already recorded the old V1 checksum:

1. Stop every API instance and take a verified PostgreSQL backup.
2. Record row counts for the legacy `public.fs_*` tables.
3. Drop only `public.flyway_schema_history`; do not drop application tables.
4. Start one API instance. Flyway baselines the non-empty database at version 0,
   runs V1, and transfers the tables into their owning schemas.
5. Compare row counts and foreign-key checks before starting other replicas.

The operation is transactional on PostgreSQL. Keep the backup until application
smoke tests and counts have passed.
