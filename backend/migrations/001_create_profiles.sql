CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(64) NOT NULL DEFAULT 'mauta',
  age_range         VARCHAR(16) DEFAULT '40-49',
  gender            VARCHAR(16) DEFAULT 'female',
  sport             VARCHAR(64) DEFAULT 'trail-running',
  level             VARCHAR(32) DEFAULT 'intermediate',
  available_min_min INT DEFAULT 60,
  available_min_max INT DEFAULT 120,
  rest_day          VARCHAR(16) DEFAULT 'sunday',
  impact_allowed    BOOLEAN DEFAULT false,
  hip_load          VARCHAR(32) DEFAULT 'limited',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);