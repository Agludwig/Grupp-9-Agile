CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,

    -- GPS location (WGS84)
    position GEOGRAPHY(POINT, 4326) NOT NULL,

    title TEXT NOT NULL,

    message TEXT NOT NULL,

    -- Creation timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    unhandled_image_path TEXT,

    -- Status
    handled BOOLEAN NOT NULL DEFAULT FALSE,

    -- When it was handled
    handled_at TIMESTAMPTZ,

    handled_image_path TEXT,

    -- Ensure consistency between handled + handled_at
    CONSTRAINT handled_consistency CHECK (
        (handled = FALSE AND handled_at IS NULL)
        OR
        (handled = TRUE AND handled_at IS NOT NULL)
    )
);

CREATE INDEX idx_reports_position
ON reports
USING GIST (position);

