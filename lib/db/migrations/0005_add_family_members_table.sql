CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    weight_lbs INTEGER,
    height_inches INTEGER,
    birth_date DATE,
    role TEXT,
    phone_number TEXT,
    email TEXT,
    call_sign TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
