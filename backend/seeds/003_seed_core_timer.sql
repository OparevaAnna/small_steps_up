-- ============================================
-- Seed: настройки таймера пресса (50/10)
-- ============================================
INSERT INTO core_timer_settings (
  user_id, title, work_seconds, rest_seconds, exercise_count,
  rounds, preparation_seconds, rest_between_rounds_seconds
)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Мой пресс', 50, 10, 10, 1, 10, 60
)
ON CONFLICT DO NOTHING;