CREATE TABLE IF NOT EXISTS modules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key           VARCHAR(64) UNIQUE NOT NULL,
  title         VARCHAR(128) NOT NULL,
  category      VARCHAR(64) NOT NULL,
  description   TEXT,
  is_obligatory BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_modules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id  UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  enabled    BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_id)
);