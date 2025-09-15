CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT,
    breed TEXT,
    age INTEGER,
    weight_lbs INTEGER,
    microchip_id TEXT,
    care_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
