-- Group chat for a listing's travelers and host.
--
-- Owned by the bookings module: holding a seat (or hosting) is what grants
-- access, so the table sits next to fs_bookings rather than in engagement,
-- which would otherwise have to depend on bookings and close a cycle.

CREATE TABLE IF NOT EXISTS bookings.fs_group_messages (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    experience_id   VARCHAR(36)     NOT NULL,
    author_id       VARCHAR(36)     NOT NULL,
    body            TEXT            NOT NULL,
    created_at      TIMESTAMP       NOT NULL,
    CONSTRAINT fk_group_messages_experience FOREIGN KEY (experience_id) REFERENCES experiences.fs_experiences (id),
    CONSTRAINT fk_group_messages_author FOREIGN KEY (author_id) REFERENCES identity.fs_users (id)
);

CREATE INDEX IF NOT EXISTS ix_group_messages_experience_created
    ON bookings.fs_group_messages (experience_id, created_at);
