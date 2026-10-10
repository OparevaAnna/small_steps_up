import { Request, Response, NextFunction } from 'express';
import { OfpProgressRepository } from '../repositories/ofpProgressRepository';
import { ProfileRepository } from '../repositories/profileRepository';
import { ExerciseRepository } from '../repositories/exerciseRepository';
import pool from '../config/database';

const ofpRepo = new OfpProgressRepository();
const profileRepo = new ProfileRepository();
const exerciseRepo = new ExerciseRepository();

interface TargetTopicBlock {
  id: string;
  title: string;
  limit_min: number;
}

const FAKE_USER_ID = '00000000-0000-0000-0000-000000000001';
const PRIORITY_IDS = {
  DAILY_MANDATORY: '00000000-0000-0000-0005-000000000002'
};


async function getWorkoutStrategy(targetMinutes: number): Promise<TargetTopicBlock[]> {

  const WARMER_UP = 25;

  // 1. Выкачиваем ровно 4 случайных топика прямо из базы данных
  const randomTopicsRes = await pool.query(`
    SELECT id, title 
    FROM topics 
    ORDER BY RANDOM() 
    LIMIT 4
  `);

  const activeTopics = randomTopicsRes.rows;
  
  if (activeTopics.length === 0) return [];

  // Переменная для подсчета распределенного времени
    const baseMinutesPerBlock = Math.floor((targetMinutes - WARMER_UP) / activeTopics.length);
    const remainderMinutes = (targetMinutes - WARMER_UP) % activeTopics.length;

  return activeTopics.map((row, index) => {
    // Первые блоки получают базовое время, а самый последний забирает базовое время + весь остаток
    const blockMinutes = index === activeTopics.length - 1 
      ? baseMinutesPerBlock + remainderMinutes 
      : baseMinutesPerBlock;

    return {
      id: row.id,
      title: row.title,
      limit_min: blockMinutes
    };
  })
}



export class OfpController {

   private calculateSeconds(ex: any): number {
    // Принудительно приводим к числу. Если там NaN, null или 0 — жестко даем 45 секунд
    const rawSec = parseInt(ex.single_set_duration_sec, 10);
    const baseSec = isNaN(rawSec) || rawSec <= 0 ? 45 : rawSec;
    
    // Если упражнение одностороннее (выполняется на каждую сторону отдельно) — удваиваем время
    const totalBaseSec = ex.is_unilateral === true || ex.is_unilateral === 'true' 
      ? (baseSec * 2) 
      : baseSec;
      
    return totalBaseSec;
  }

  async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string;
      if (!date) {
        res.status(400).json({ error: 'Missing date query parameter' });
        return;
      }

      const profile = await profileRepo.findFirst();
      if (!profile) {
        res.status(404).json({ error: 'No profile found. Create a profile first.' });
        return;
      }

      const progress = await ofpRepo.findByProfileAndDate(profile.id, date);

      res.json({
        variant: progress?.variant ?? 35,
        completedIds: progress?.completed_ids ?? [],
        stepsDone: progress?.steps_done ?? false,
      });
    } catch (err) {
      next(err);
    }
  }

  async saveProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, variant, completedIds, stepsDone } = req.body;

      if (!date) {
        res.status(400).json({ error: 'Missing date in body' });
        return;
      }

      const profile = await profileRepo.findFirst();
      if (!profile) {
        res.status(404).json({ error: 'No profile found. Create a profile first.' });
        return;
      }

      const progress = await ofpRepo.upsert(profile.id, {
        date,
        variant,
        completedIds,
        stepsDone,
      });

      res.json({
        variant: progress.variant,
        completedIds: progress.completed_ids,
        stepsDone: progress.steps_done,
      });
    } catch (err) {
      next(err);
    }
  }

  async getDailyOfp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateStr = req.query.date as string;
      const targetDurationStr = req.query.duration as string; // '35', '50', '70'

      if (!dateStr || !targetDurationStr) {
        res.status(400).json({ error: 'Missing date or duration parameters' });
        return;
      }

      const targetMinutes = parseInt(targetDurationStr, 10);

      // =======================================================================
      // 🕵️ ШАГ 1: ПРОВЕРЯЕМ, ЕСТЬ ЛИ СГЕНЕРИРОВАННЫЙ ПЛАН НА СЕГОДНЯ В БАЗЕ
      // =======================================================================
      const cachedWorkoutRes = await pool.query(
        'SELECT max_workout_payload FROM daily_ofp WHERE user_id = \$1 AND workout_date = \$2',
        [FAKE_USER_ID, dateStr]
      );

      let maxWorkoutPayload: any;

      if (cachedWorkoutRes.rows.length > 0) {
        maxWorkoutPayload = cachedWorkoutRes.rows[0].max_workout_payload;
      } else {
        const eqResult = await pool.query('SELECT id FROM equipment WHERE is_home_friendly = true');
        const homeEquipmentIds = eqResult.rows.map(row => row.id);

        const maxStrategy = await getWorkoutStrategy(70); 
        const usedIds = new Set<string>();
        const generatedBlocks: any[] = [];

        const shuffleArray = (array: any[]) => {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        };

        for (const targetBlock of maxStrategy) {
          const blockExercises: any[] = [];
          let currentBlockSec = 0;

          const topicExercises = await exerciseRepo.findByFilters({
            equipment: homeEquipmentIds,
            topics: [targetBlock.id]
          });

          const filteredPool = topicExercises.filter(ex => !usedIds.has(ex.id));

          const mandatoryExercises = filteredPool.filter(ex => 
            ex.routine_types.some((r: any) => r.id === PRIORITY_IDS.DAILY_MANDATORY)
          );
          const regularExercises = filteredPool.filter(ex => 
            !ex.routine_types.some((r: any) => r.id === PRIORITY_IDS.DAILY_MANDATORY)
          );

          const finalPool = [
            ...shuffleArray(mandatoryExercises),
            ...shuffleArray(regularExercises)
          ];

          for (const ex of finalPool) {
            const sec = this.calculateSeconds(ex);
            if (currentBlockSec + sec <= targetBlock.limit_min * 60) {
              blockExercises.push({
                id: ex.id,
                title: ex.title,
                short_description: ex.short_description,
                is_unilateral: ex.is_unilateral,
                how_to: ex.how_to,
                purpose: ex.purpose,
                single_set_duration_sec: ex.single_set_duration_sec, // обязательно кэшируем число секунд
                single_dose: ex.single_dose || ex.single_dose_text || '15 повторений'
              });
              currentBlockSec += sec;
              usedIds.add(ex.id);
            }
          }

          generatedBlocks.push({
            id: `topic_${targetBlock.id.slice(-12)}`,
            title: targetBlock.title,
            max_limit_min: targetBlock.limit_min, 
            exercises: blockExercises
          });
        }

        maxWorkoutPayload = { blocks: generatedBlocks };

        await pool.query(
          'INSERT INTO daily_ofp (user_id, workout_date, max_workout_payload) VALUES (\$1, \$2, \$3)',
          [FAKE_USER_ID, dateStr, JSON.stringify(maxWorkoutPayload)]
        );
      }

      // =======================================================================
      // 🎯 ШАГ 2: УМНАЯ СУЖАЮЩАЯ ФИЛЬТРАЦИЯ ПОД ТЕКУЩИЙ ЗАПРОС МИНУТ (35 / 50 / 70)
      // =======================================================================
      const baseMinutesPerBlock = Math.floor(targetMinutes / maxWorkoutPayload.blocks.length);
      const remainderMinutes = targetMinutes % maxWorkoutPayload.blocks.length;

      let totalCalculatedSec = 0;

      const finalResponseBlocks = maxWorkoutPayload.blocks.map((cachedBlock: any, index: number) => {
        const currentBlockLimitMin = index === maxWorkoutPayload.blocks.length - 1
          ? baseMinutesPerBlock + remainderMinutes
          : baseMinutesPerBlock;

        const filteredExercises: any[] = [];
        let accumulatedSec = 0;

        for (const ex of cachedBlock.exercises) {
          const sec = this.calculateSeconds(ex);
          
          // Жесткая отсечка по накопленному времени внутри сжатого блока
          if (accumulatedSec + sec <= currentBlockLimitMin * 60) {
            filteredExercises.push({
              id: ex.id,
              title: ex.title,
              short_description: ex.short_description,
              is_unilateral: ex.is_unilateral,
              how_to: ex.how_to,
              purpose: ex.purpose || [],
              dose: ex.is_unilateral 
                ? `1 подход: ${ex.single_dose} (на каждую сторону)` 
                : `1 подход: ${ex.single_dose}`
            });
            accumulatedSec += sec;
          }
        }

        totalCalculatedSec += accumulatedSec;

        return {
          id: cachedBlock.id,
          title: cachedBlock.title,
          duration_min: currentBlockLimitMin,
          exercises: filteredExercises
        };
      });

      res.json({
        workout_type: '🏆 Ежедневное ОФП «Маленькие шаги»',
        total_target_min: targetMinutes,
        total_calculated_min: Math.round(totalCalculatedSec / 60) || targetMinutes, 
        blocks: finalResponseBlocks
      });

    } catch (err) {
      next(err);
    }
  }
}