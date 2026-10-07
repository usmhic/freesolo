-- Multi-day group trips alongside single-session experiences.
--
-- A listing is now either an `experience` (a few hours at an approved venue)
-- or a `trip` (several days, hosted by a member, venue optional). Trips carry
-- a day-by-day itinerary and a list of what the price covers, and hosts can
-- choose to approve each traveler who asks to join.
--
-- Existing rows become instant-join experiences, which is exactly how they
-- behaved before this migration. Every statement is idempotent.

ALTER TABLE experiences.fs_experiences
    ADD COLUMN IF NOT EXISTS kind         VARCHAR(255) NOT NULL DEFAULT 'experience',
    ADD COLUMN IF NOT EXISTS end_date     VARCHAR(255),
    ADD COLUMN IF NOT EXISTS itinerary    TEXT         NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS included     TEXT         NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS join_policy  VARCHAR(255) NOT NULL DEFAULT 'instant';

-- Trips do not need a venue; experiences still require one (enforced in the API).
ALTER TABLE experiences.fs_experiences
    ALTER COLUMN business_id DROP NOT NULL;

-- When the host accepted or declined a join request.
ALTER TABLE bookings.fs_bookings
    ADD COLUMN IF NOT EXISTS decided_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS ix_experiences_kind_status
    ON experiences.fs_experiences (kind, status);

CREATE INDEX IF NOT EXISTS ix_bookings_experience_status
    ON bookings.fs_bookings (experience_id, status);
