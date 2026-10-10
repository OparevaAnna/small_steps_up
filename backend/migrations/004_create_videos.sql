CREATE TABLE IF NOT EXISTS videos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(256) NOT NULL,
  source_type       VARCHAR(16) NOT NULL CHECK (source_type IN ('upload', 'url')),
  url               TEXT NOT NULL,
  duration_minutes  INT NOT NULL DEFAULT 15,
  environment       VARCHAR(32) NOT NULL DEFAULT 'standing-and-mat' CHECK (environment IN ('standing-and-mat', 'standing-only')),
  requires_mat      BOOLEAN DEFAULT true,
  status            VARCHAR(16) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_used_at      TIMESTAMPTZ,
  usage_count       INT DEFAULT 0,
  tags              TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercise_clips (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id  UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  video_id     UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  start_sec    INT,
  end_sec      INT,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);