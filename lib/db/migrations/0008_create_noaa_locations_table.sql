CREATE TABLE IF NOT EXISTS noaa_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    full_address TEXT,
    street_number TEXT,
    street_name TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS noaa_locations_user_id_idx ON noaa_locations(user_id);