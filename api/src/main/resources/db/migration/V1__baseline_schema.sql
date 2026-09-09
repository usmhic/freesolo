-- FreeSolo modular-monolith baseline.
--
-- Fresh databases are created directly in domain-owned schemas. When the
-- legacy public-schema tables exist, this same migration transfers them with
-- ALTER TABLE ... SET SCHEMA, which preserves rows, indexes, and constraints.

CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS partners;
CREATE SCHEMA IF NOT EXISTS experiences;
CREATE SCHEMA IF NOT EXISTS bookings;
CREATE SCHEMA IF NOT EXISTS engagement;
CREATE SCHEMA IF NOT EXISTS media;

DO $$
DECLARE
    mapping TEXT[];
BEGIN
    FOREACH mapping SLICE 1 IN ARRAY ARRAY[
        ARRAY['fs_users', 'identity'],
        ARRAY['fs_oauth_accounts', 'identity'],
        ARRAY['fs_otp_codes', 'identity'],
        ARRAY['fs_businesses', 'partners'],
        ARRAY['fs_applications', 'partners'],
        ARRAY['fs_experiences', 'experiences'],
        ARRAY['fs_reviews', 'experiences'],
        ARRAY['fs_bookings', 'bookings'],
        ARRAY['fs_notifications', 'engagement'],
        ARRAY['fs_email_campaigns', 'engagement'],
        ARRAY['fs_uploads', 'media'],
        ARRAY['fs_event_photos', 'media']
    ]
    LOOP
        IF to_regclass(format('public.%I', mapping[1])) IS NOT NULL
           AND to_regclass(format('%I.%I', mapping[2], mapping[1])) IS NULL THEN
            EXECUTE format('ALTER TABLE public.%I SET SCHEMA %I', mapping[1], mapping[2]);
        END IF;
    END LOOP;
END
$$;

CREATE TABLE IF NOT EXISTS identity.fs_users (
    id                  VARCHAR(36)         NOT NULL PRIMARY KEY,
    email               VARCHAR(255)        NOT NULL,
    email_verified      BOOLEAN             NOT NULL,
    name                VARCHAR(255),
    image               VARCHAR(255),
    phone               VARCHAR(255),
    bio                 VARCHAR(255),
    role                VARCHAR(255),
    status              VARCHAR(255),
    countries_visited   INTEGER             NOT NULL,
    push_token          VARCHAR(255),
    marketing_opt_in    BOOLEAN             NOT NULL,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS partners.fs_businesses (
    id                  VARCHAR(36)         NOT NULL PRIMARY KEY,
    owner_id            VARCHAR(36)         NOT NULL,
    name                VARCHAR(255)        NOT NULL,
    type                VARCHAR(255)        NOT NULL,
    address             VARCHAR(255)        NOT NULL,
    city                VARCHAR(255)        NOT NULL,
    country             VARCHAR(255),
    lat                 DOUBLE PRECISION,
    lng                 DOUBLE PRECISION,
    maps_link           VARCHAR(255),
    tripadvisor         VARCHAR(255),
    instagram           VARCHAR(255),
    website             VARCHAR(255),
    description         TEXT,
    cover_image         VARCHAR(255),
    images              TEXT,
    status              VARCHAR(255),
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP,
    CONSTRAINT fk_businesses_owner FOREIGN KEY (owner_id) REFERENCES identity.fs_users (id)
);

CREATE TABLE IF NOT EXISTS experiences.fs_experiences (
    id                  VARCHAR(36)         NOT NULL PRIMARY KEY,
    host_id             VARCHAR(36)         NOT NULL,
    business_id         VARCHAR(36)         NOT NULL,
    title               VARCHAR(255)        NOT NULL,
    description         TEXT                NOT NULL,
    category            VARCHAR(255)        NOT NULL,
    emoji               VARCHAR(255),
    city                VARCHAR(255)        NOT NULL,
    country             VARCHAR(255),
    lat                 DOUBLE PRECISION,
    lng                 DOUBLE PRECISION,
    date                VARCHAR(255)        NOT NULL,
    time                VARCHAR(255)        NOT NULL,
    duration_mins       INTEGER             NOT NULL,
    min_seats           INTEGER             NOT NULL,
    max_seats           INTEGER             NOT NULL,
    price               DOUBLE PRECISION    NOT NULL,
    currency            VARCHAR(255),
    cover_image         VARCHAR(255),
    images              TEXT,
    tags                TEXT,
    status              VARCHAR(255),
    featured            BOOLEAN             NOT NULL,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP,
    CONSTRAINT fk_experiences_host FOREIGN KEY (host_id) REFERENCES identity.fs_users (id),
    CONSTRAINT fk_experiences_business FOREIGN KEY (business_id) REFERENCES partners.fs_businesses (id)
);

CREATE TABLE IF NOT EXISTS bookings.fs_bookings (
    id                          VARCHAR(36)         NOT NULL PRIMARY KEY,
    user_id                     VARCHAR(36)         NOT NULL,
    experience_id               VARCHAR(36)         NOT NULL,
    seats                       INTEGER             NOT NULL,
    status                      VARCHAR(255),
    guest_note                  VARCHAR(255),
    cancel_reason               VARCHAR(255),
    confirmed_at                TIMESTAMP,
    cancelled_at                TIMESTAMP,
    completed_at                TIMESTAMP,
    refunded_at                 TIMESTAMP,
    created_at                  TIMESTAMP,
    updated_at                  TIMESTAMP,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES identity.fs_users (id),
    CONSTRAINT fk_bookings_experience FOREIGN KEY (experience_id) REFERENCES experiences.fs_experiences (id)
);

CREATE TABLE IF NOT EXISTS partners.fs_applications (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    user_id         VARCHAR(36)     NOT NULL,
    story           TEXT            NOT NULL,
    image_url       VARCHAR(255),
    status          VARCHAR(255),
    review_note     VARCHAR(255),
    reviewed_at     TIMESTAMP,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES identity.fs_users (id)
);

CREATE TABLE IF NOT EXISTS engagement.fs_email_campaigns (
    id                  VARCHAR(36)     NOT NULL PRIMARY KEY,
    title               VARCHAR(255)    NOT NULL,
    subject             VARCHAR(255)    NOT NULL,
    body                TEXT            NOT NULL,
    segment             VARCHAR(255),
    status              VARCHAR(255),
    scheduled_at        TIMESTAMP,
    sent_at             TIMESTAMP,
    recipient_count     INTEGER         NOT NULL,
    created_by_id       VARCHAR(36)     NOT NULL,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP,
    CONSTRAINT fk_email_campaigns_created_by FOREIGN KEY (created_by_id) REFERENCES identity.fs_users (id)
);

CREATE TABLE IF NOT EXISTS media.fs_event_photos (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    experience_id   VARCHAR(36)     NOT NULL,
    booking_id      VARCHAR(36)     NOT NULL,
    user_id         VARCHAR(36)     NOT NULL,
    url             VARCHAR(255)    NOT NULL,
    key             VARCHAR(255)    NOT NULL,
    caption         VARCHAR(255),
    created_at      TIMESTAMP,
    CONSTRAINT fk_event_photos_experience FOREIGN KEY (experience_id) REFERENCES experiences.fs_experiences (id),
    CONSTRAINT fk_event_photos_booking FOREIGN KEY (booking_id) REFERENCES bookings.fs_bookings (id),
    CONSTRAINT fk_event_photos_user FOREIGN KEY (user_id) REFERENCES identity.fs_users (id)
);

CREATE TABLE IF NOT EXISTS engagement.fs_notifications (
    id          VARCHAR(36)     NOT NULL PRIMARY KEY,
    user_id     VARCHAR(36)     NOT NULL,
    type        VARCHAR(255)    NOT NULL,
    title       VARCHAR(255)    NOT NULL,
    body        TEXT            NOT NULL,
    data        TEXT,
    read        BOOLEAN         NOT NULL,
    sent_push   BOOLEAN         NOT NULL,
    created_at  TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES identity.fs_users (id)
);

CREATE TABLE IF NOT EXISTS identity.fs_oauth_accounts (
    id                          VARCHAR(36)     NOT NULL PRIMARY KEY,
    user_id                     VARCHAR(36)     NOT NULL,
    provider_id                 VARCHAR(255)    NOT NULL,
    account_id                  VARCHAR(255)    NOT NULL,
    access_token                TEXT,
    refresh_token               TEXT,
    id_token                    TEXT,
    access_token_expires_at     TIMESTAMP,
    scope                       VARCHAR(255),
    created_at                  TIMESTAMP,
    updated_at                  TIMESTAMP,
    CONSTRAINT fk_oauth_accounts_user FOREIGN KEY (user_id) REFERENCES identity.fs_users (id),
    CONSTRAINT uq_oauth_accounts_provider_account UNIQUE (provider_id, account_id)
);

CREATE TABLE IF NOT EXISTS identity.fs_otp_codes (
    id          VARCHAR(36)     NOT NULL PRIMARY KEY,
    user_id     VARCHAR(36)     NOT NULL,
    code        VARCHAR(6)      NOT NULL,
    expires_at  TIMESTAMP       NOT NULL,
    created_at  TIMESTAMP,
    CONSTRAINT fk_otp_codes_user FOREIGN KEY (user_id) REFERENCES identity.fs_users (id)
);

CREATE TABLE IF NOT EXISTS experiences.fs_reviews (
    id                  VARCHAR(36)     NOT NULL PRIMARY KEY,
    author_id           VARCHAR(36)     NOT NULL,
    target_user_id      VARCHAR(36),
    experience_id       VARCHAR(36),
    booking_id          VARCHAR(36)     NOT NULL,
    rating              INTEGER         NOT NULL,
    body                TEXT            NOT NULL,
    reply               TEXT,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP,
    CONSTRAINT fk_reviews_author FOREIGN KEY (author_id) REFERENCES identity.fs_users (id),
    CONSTRAINT fk_reviews_target FOREIGN KEY (target_user_id) REFERENCES identity.fs_users (id),
    CONSTRAINT fk_reviews_experience FOREIGN KEY (experience_id) REFERENCES experiences.fs_experiences (id),
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings.fs_bookings (id),
    CONSTRAINT uq_reviews_booking_id UNIQUE (booking_id)
);

CREATE TABLE IF NOT EXISTS media.fs_uploads (
    id          VARCHAR(36)     NOT NULL PRIMARY KEY,
    user_id     VARCHAR(36)     NOT NULL,
    url         VARCHAR(255)    NOT NULL,
    key         VARCHAR(255)    NOT NULL,
    type        VARCHAR(255)    NOT NULL,
    size        BIGINT          NOT NULL,
    created_at  TIMESTAMP,
    CONSTRAINT fk_uploads_user FOREIGN KEY (user_id) REFERENCES identity.fs_users (id),
    CONSTRAINT uq_uploads_key UNIQUE (key)
);
