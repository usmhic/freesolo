-- Trip planning: members' saved journeys, and the route a hosted trip follows.
--
-- A plan is owned by one member and holds ordered stops plus the route the
-- API computed between them (OpenRouteService, or a straight-line estimate
-- when no routing key is configured). JSON is stored as TEXT, matching the
-- other list fields in this database.

CREATE SCHEMA IF NOT EXISTS planning;

CREATE TABLE IF NOT EXISTS planning.fs_journey_plans (
    id                  VARCHAR(36)         NOT NULL PRIMARY KEY,
    owner_id            VARCHAR(36)         NOT NULL,
    title               VARCHAR(255)        NOT NULL,
    profile             VARCHAR(64)         NOT NULL,
    start_date          VARCHAR(32),
    stops               TEXT                NOT NULL,
    route               TEXT,
    distance_meters     DOUBLE PRECISION    NOT NULL DEFAULT 0,
    duration_seconds    DOUBLE PRECISION    NOT NULL DEFAULT 0,
    created_at          TIMESTAMP           NOT NULL,
    updated_at          TIMESTAMP           NOT NULL,
    CONSTRAINT fk_journey_plans_owner FOREIGN KEY (owner_id) REFERENCES identity.fs_users (id)
);

CREATE INDEX IF NOT EXISTS ix_journey_plans_owner_updated
    ON planning.fs_journey_plans (owner_id, updated_at DESC);

-- The route a hosted trip follows, copied from one of the host's plans.
ALTER TABLE experiences.fs_experiences
    ADD COLUMN IF NOT EXISTS route TEXT;
