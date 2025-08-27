-- This migration adapts the database schema for use with NextAuth.js and its PG adapter.
-- It uses UUIDs for user IDs to match the existing schema, instead of the default SERIAL integers.

-- Create the accounts table
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

-- Create the sessions table
CREATE TABLE sessions
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

-- Create the verification_token table
CREATE TABLE verification_token
(
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Add new columns to the users table
ALTER TABLE users
ADD COLUMN "emailVerified" TIMESTAMPTZ,
ADD COLUMN image TEXT;
