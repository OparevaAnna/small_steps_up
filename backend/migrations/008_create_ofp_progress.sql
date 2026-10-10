CREATE TABLE IF NOT EXISTS ofp_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  variant         INT NOT NULL DEFAULT 35 CHECK (variant IN (35, 50, 70)),
  completed_ids   JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps_done      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, date)
);