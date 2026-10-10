CREATE TABLE IF NOT EXISTS execution_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_plan_id     UUID NOT NULL REFERENCES day_plans(id) ON DELETE CASCADE,
  block_type      VARCHAR(32) NOT NULL CHECK (block_type IN (
    'main-workout','ofp-joint','ofp-core','ofp-variable','ofp-extra','stretching','mfr'
  )),
  exercise_id     UUID REFERENCES exercises(id) ON DELETE SET NULL,
  started_at      TIMESTAMPTZ NOT NULL,
  completed_at    TIMESTAMPTZ,
  duration_seconds INT,
  stopped_early   BOOLEAN DEFAULT false,
  discomfort      BOOLEAN DEFAULT false,
  rpe             INT CHECK (rpe BETWEEN 1 AND 10),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);