-- The city history game. Lesson content is curated in the repository
-- (classpath play/cities/*.json); the database only records players' progress
-- and which city packs they've unlocked.

CREATE SCHEMA IF NOT EXISTS play;

CREATE TABLE IF NOT EXISTS play.fs_lesson_progress (
    id          VARCHAR(36)     NOT NULL PRIMARY KEY,
    user_id     VARCHAR(36)     NOT NULL,
    city_id     VARCHAR(64)     NOT NULL,
    lesson_id   VARCHAR(64)     NOT NULL,
    stardust    INTEGER         NOT NULL,
    hints_used  INTEGER         NOT NULL DEFAULT 0,
    solved_at   TIMESTAMP       NOT NULL,
    CONSTRAINT fk_lesson_progress_user FOREIGN KEY (user_id) REFERENCES identity.fs_users (id),
    CONSTRAINT uq_lesson_progress UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS ix_lesson_progress_user ON play.fs_lesson_progress (user_id, solved_at DESC);

CREATE TABLE IF NOT EXISTS play.fs_city_unlocks (
    id          VARCHAR(36)     NOT NULL PRIMARY KEY,
    user_id     VARCHAR(36)     NOT NULL,
    city_id     VARCHAR(64)     NOT NULL,
    unlocked_at TIMESTAMP       NOT NULL,
    CONSTRAINT fk_city_unlocks_user FOREIGN KEY (user_id) REFERENCES identity.fs_users (id),
    CONSTRAINT uq_city_unlocks UNIQUE (user_id, city_id)
);
