-- Add address columns to family_members table
ALTER TABLE family_members
ADD COLUMN street_number TEXT,
ADD COLUMN street_name TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN zip_code TEXT;

-- Create Pets Table
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

-- Create Medical Needs Table
CREATE TABLE medical_needs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    condition TEXT NOT NULL,
    medication TEXT,
    dosage TEXT,
    frequency TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Plan Locations Table
CREATE TABLE plan_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT, -- e.g., 'home', 'work', 'school', 'meeting_point'
    street_number TEXT,
    street_name TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add hazard_type to plans table
ALTER TABLE plans
ADD COLUMN hazard_type TEXT;

-- Create Plan Contacts Table
CREATE TABLE plan_contacts (
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, family_member_id)
);
