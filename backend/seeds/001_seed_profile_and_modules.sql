-- ============================================
-- Seed: профиль пользователя (mauta)
-- ============================================
INSERT INTO profiles (id, name, age_range, gender, sport, level,
  available_min_min, available_min_max, rest_day,
  impact_allowed, hip_load)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'mauta', '40-49', 'female', 'trail-running', 'intermediate',
  60, 120, 'sunday',
  false, 'limited'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- Seed: модули
-- ============================================
INSERT INTO modules (id, key, title, category, description, is_obligatory) VALUES
  ('10000001-0000-0000-0000-000000000001', 'joint-mobility',   'Суставная гимнастика', 'mandatory', 'Ежедневная суставная гимнастика 15 мин', true),
  ('10000002-0000-0000-0000-000000000000', 'core',            'Пресс/стабилизация корпуса', 'mandatory', 'Ежедневный пресс 10 мин по таймеру 50/10', true),
  ('10000003-0000-0000-0000-000000000000', 'hip-rehab',       'ЛФК ТБС', 'rehab', 'Лечебная физкультура для тазобедренных суставов', false),
  ('10000004-0000-0000-0000-000000000000', 'neck-posture',    'Шея и осанка', 'rehab', 'Упражнения для шеи, осанки и положения головы', false),
  ('10000005-0000-0000-0000-000000000000', 'trail-running',   'Трейлраннинг', 'cardio', 'Основная аэробная подготовка для горного бега', false),
  ('10000006-0000-0000-0000-000000000000', 'bike',            'Велосипед', 'cardio', 'Велостанок как кардио', false),
  ('10000007-0000-0000-0000-000000000000', 'pull-up',         'Подтягивание', 'skill', 'Подготовка к подтягиванию', false),
  ('10000008-0000-0000-0000-000000000000', 'fold',            'Складка', 'skill', 'Развитие складки', false),
  ('10000009-0000-0000-0000-000000000000', 'handstand',       'Стойка на руках', 'skill', 'Развитие стойки на руках', false),
  ('10000010-0000-0000-0000-000000000000', 'l-sit',           'Уголок', 'skill', 'Развитие уголка', false),
  ('10000001-0000-0000-0000-000000000011', 'spine-back',      'Осанка и спина', 'rehab', 'Упражнения для спины и осанки', false),
  ('21000001-0000-0000-0000-000000000012', 'feet-balance',    'Стопы и баланс', 'rehab', 'Укрепление стоп и голеностопа, баланс', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Seed: включённые модули пользователя
-- ============================================
INSERT INTO user_modules (user_id, module_id, enabled)
SELECT 
  'a0000000-0000-0000-0000-000000000001',
  id,
  true
FROM modules
WHERE key IN ('joint-mobility', 'core', 'hip-rehab', 'neck-posture', 'trail-running', 'bike', 'pull-up', 'fold', 'spine-back', 'feet-balance')
ON CONFLICT DO NOTHING;

-- Отключаем стойку и уголок пока
INSERT INTO user_modules (user_id, module_id, enabled)
SELECT 
  'a0000000-0000-0000-0000-000000000001',
  id,
  false
FROM modules
WHERE key IN ('handstand', 'l-sit')
ON CONFLICT DO NOTHING;