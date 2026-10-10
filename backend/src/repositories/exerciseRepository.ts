import pool from '../config/database';
import { Exercise, ExerciseStatus } from '../models/Exercise';

export class ExerciseRepository {
  // Базовая часть SQL-запроса, собирающая абсолютно все справочники со связями в JSON
  private readonly baseSelectQuery = `
    SELECT 
      e.*,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'title', t.title)) FILTER (WHERE t.id IS NOT NULL), '[]') as topics,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', eq.id, 'title', eq.title)) FILTER (WHERE eq.id IS NOT NULL), '[]') as equipment,COALESCE(json_agg(DISTINCT jsonb_build_object('id', eq.id, 'title', eq.title, 'is_home_friendly', eq.is_home_friendly)) FILTER (WHERE eq.id IS NOT NULL), '[]') as equipment,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', bp.id, 'title', bp.title)) FILTER (WHERE bp.id IS NOT NULL), '[]') as body_parts,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', q.id, 'title', q.title)) FILTER (WHERE q.id IS NOT NULL), '[]') as qualities,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'title', c.title)) FILTER (WHERE c.id IS NOT NULL), '[]') as contraindications,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', rt.id, 'title', rt.title)) FILTER (WHERE rt.id IS NOT NULL), '[]') as routine_types,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', tf.id, 'title', tf.title)) FILTER (WHERE tf.id IS NOT NULL), '[]') as target_formats
    FROM exercises e
    
    -- Присоединяем промежуточные таблицы и сами справочники
    LEFT JOIN exercise_topics et ON e.id = et.exercise_id
    LEFT JOIN topics t ON et.topic_id = t.id
    
    LEFT JOIN exercise_equipment eeq ON e.id = eeq.exercise_id
    LEFT JOIN equipment eq ON eeq.equipment_id = eq.id
    
    LEFT JOIN exercise_body_parts ebp ON e.id = ebp.exercise_id
    LEFT JOIN body_parts bp ON ebp.body_part_id = bp.id
    
    LEFT JOIN exercise_qualities eqt ON e.id = eqt.exercise_id
    LEFT JOIN qualities q ON eqt.quality_id = q.id
    
    LEFT JOIN exercise_contraindications ec ON e.id = ec.exercise_id
    LEFT JOIN contraindications c ON ec.contraindication_id = c.id

    -- 🆕 НОВЫЕ СВЯЗИ: Рутины (обязательность) и Форматы (контекст выполнения)
    LEFT JOIN exercises_routine_types ert ON e.id = ert.exercise_id
    LEFT JOIN routine_types rt ON ert.routine_type_id = rt.id

    LEFT JOIN exercises_target_formats etf ON e.id = etf.exercise_id
    LEFT JOIN target_formats tf ON etf.target_format_id = tf.id
  `;

  // Получить все подтвержденные упражнения
  async findAll(): Promise<Exercise[]> {
    const query = `
      ${this.baseSelectQuery}
      WHERE e.status = $1
      GROUP BY e.id
      ORDER BY e.title
    `;
    const result = await pool.query(query, [ExerciseStatus.CONFIRMED]);
    return result.rows;
  }

  // Найти конкретное упражнение по ID со всеми его тегами и пререквизитами
  async findById(id: string): Promise<Exercise | null> {
    const query = `
      ${this.baseSelectQuery}
      WHERE e.id = $1
      GROUP BY e.id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Умный фильтр с учетом реляционной структуры, рутин, форматов и противопоказаний
  async findByFilters(filters: {
    bodyParts?: string[];       // Массив ID мышц
    equipment?: string[];       // Массив ID доступного инвентаря
    qualities?: string[];       // Массив ID качеств
    topics?: string[];          // Массив ID направлений
    routineTypes?: string[];    // 🆕 Массив ID типов рутин (например, ['...daily_core'])
    targetFormats?: string[];   // 🆕 Массив ID целевых форматов (например, ['...microdosing'])
    difficulty?: number;
    impact?: number;
    excludeContraindications?: string[]; // Массив ID противопоказаний пользователя
  }): Promise<Exercise[]> {
    let query = `${this.baseSelectQuery} WHERE e.status = $1`;
    const params: unknown[] = [ExerciseStatus.CONFIRMED];
    let paramIndex = 2;

    // Фильтрация по направлениям (topics)
    if (filters.topics?.length) {
      query += ` AND e.id IN (SELECT exercise_id FROM exercise_topics WHERE topic_id = ANY($${paramIndex++}))`;
      params.push(filters.topics);
    }

    // Фильтрация по инвентарю (equipment)
    if (filters.equipment?.length) {
      query += ` AND e.id IN (SELECT exercise_id FROM exercise_equipment WHERE equipment_id = ANY($${paramIndex++}))`;
      params.push(filters.equipment);
    }

    // Фильтрация по зонам тела (bodyParts)
    if (filters.bodyParts?.length) {
      query += ` AND e.id IN (SELECT exercise_id FROM exercise_body_parts WHERE body_part_id = ANY($${paramIndex++}))`;
      params.push(filters.bodyParts);
    }

    // Фильтрация по беговым качествам (qualities)
    if (filters.qualities?.length) {
      query += ` AND e.id IN (SELECT exercise_id FROM exercise_qualities WHERE quality_id = ANY($${paramIndex++}))`;
      params.push(filters.qualities);
    }

    // 🆕 Фильтрация по типам рутин (routineTypes)
    if (filters.routineTypes?.length) {
      query += ` AND e.id IN (SELECT exercise_id FROM exercises_routine_types WHERE routine_type_id = ANY($${paramIndex++}))`;
      params.push(filters.routineTypes);
    }

    // 🆕 Фильтрация по целевым форматам (targetFormats)
    if (filters.targetFormats?.length) {
      query += ` AND e.id IN (SELECT exercise_id FROM exercises_target_formats WHERE target_format_id = ANY($${paramIndex++}))`;
      params.push(filters.targetFormats);
    }

    // Фильтр сложности
    if (filters.difficulty) {
      query += ` AND e.difficulty <= $${paramIndex++}`;
      params.push(filters.difficulty);
    }

    // Фильтр влияния
    if (filters.impact !== undefined) {
      query += ` AND e.impact <= $${paramIndex++}`;
      params.push(filters.impact);
    }

    // Медицинская логика: Автоматически полностью исключаем опасные упражнения
    if (filters.excludeContraindications?.length) {
      query += ` AND e.id NOT IN (SELECT exercise_id FROM exercise_contraindications WHERE contraindication_id = ANY($${paramIndex++}))`;
      params.push(filters.excludeContraindications);
    }

    // Группировка обязательна для агрегатных функций json_agg
    query += ' GROUP BY e.id ORDER BY e.title';
    
    const result = await pool.query(query, params);
    return result.rows;
  }
}
