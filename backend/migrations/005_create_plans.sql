CREATE TABLE IF NOT EXISTS week_plans (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  rest_day   VARCHAR(16) DEFAULT 'sunday',
  status     VARCHAR(16) DEFAULT 'planned' CHECK (status IN ('planned','active','completed','adjusted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_start)
);

CREATE TABLE IF NOT EXISTS core_timer_settings (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title                       VARCHAR(128) DEFAULT 'Мой пресс',
  work_seconds                INT DEFAULT 50,
  rest_seconds                INT DEFAULT 10,
  exercise_count              INT DEFAULT 10,
  rounds                      INT DEFAULT 1,
  preparation_seconds         INT DEFAULT 10,
  rest_between_rounds_seconds INT DEFAULT 60,
  updated_at                  TIMESTAMPTZ DEFAULT now()
);