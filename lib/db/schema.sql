-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    "emailVerified" TIMESTAMPTZ,
    image TEXT,
    password_hash TEXT,
    subscription_plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User Settings Table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    noaa_alert_locations JSONB,
    notification_settings JSONB,
    -- Storing credit card info directly is not secure.
    -- This is a placeholder and should be handled by a payment provider like Stripe.
    credit_card_info TEXT
);

-- Inventory Items Table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    is_food_item BOOLEAN DEFAULT false,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    category TEXT,
    location TEXT,
    min_stock INTEGER,
    cost_per_unit NUMERIC(10, 2),
    purchase_date DATE,
    calories INTEGER,
    supplier TEXT,
    upc TEXT,
    image TEXT
);

-- Plans Table
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Kits Table
CREATE TABLE kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    gps_location POINT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Routes Table
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_location TEXT,
    end_location TEXT,
    waypoints JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Plan Items (Join Table)
CREATE TABLE plan_items (
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    PRIMARY KEY (plan_id, item_id)
);

-- Kit Items (Join Table)
CREATE TABLE kit_items (
    kit_id UUID REFERENCES kits(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    PRIMARY KEY (kit_id, item_id)
);

-- Plan Kits (Join Table)
CREATE TABLE plan_kits (
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    kit_id UUID REFERENCES kits(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, kit_id)
);

-- Shopping Lists Table
CREATE TABLE shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'My Shopping List',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Shopping List Items Table
CREATE TABLE shopping_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    is_purchased BOOLEAN DEFAULT false,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    category TEXT,
    estimated_cost NUMERIC(10, 2),
    preferred_store TEXT,
    reason TEXT
);

-- Knowledge Base Tips Table
CREATE TABLE knowledge_base_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tip TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- NextAuth.js Tables

CREATE TABLE accounts
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  UNIQUE (provider, "providerAccountId")
);

CREATE TABLE sessions
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE verification_token
(
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Family Members Table
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
