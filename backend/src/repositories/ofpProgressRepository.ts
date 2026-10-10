import pool from '../config/database';
import { OfpProgress, SaveOfpProgressDTO } from '../models/OfpProgress';

export class OfpProgressRepository {
  async findByProfileAndDate(profileId: string, date: string): Promise<OfpProgress | null> {
    const result = await pool.query(
      'SELECT * FROM ofp_progress WHERE profile_id = $1 AND date = $2',
      [profileId, date]
    );
    if (!result.rows[0]) return null;
    return this.mapRow(result.rows[0]);
  }

  async upsert(profileId: string, data: SaveOfpProgressDTO): Promise<OfpProgress> {
    const existing = await this.findByProfileAndDate(profileId, data.date);

    if (existing) {
      const completedIds = data.completedIds ?? existing.completed_ids;
      const variant = data.variant ?? existing.variant;
      const stepsDone = data.stepsDone ?? existing.steps_done;

      const result = await pool.query(
        `UPDATE ofp_progress
         SET variant = $1, completed_ids = $2::jsonb, steps_done = $3, updated_at = now()
         WHERE profile_id = $4 AND date = $5
         RETURNING *`,
        [variant, JSON.stringify(completedIds), stepsDone, profileId, data.date]
      );
      return this.mapRow(result.rows[0]);
    } else {
      const result = await pool.query(
        `INSERT INTO ofp_progress (profile_id, date, variant, completed_ids, steps_done)
         VALUES ($1, $2, $3, $4::jsonb, $5)
         RETURNING *`,
        [
          profileId,
          data.date,
          data.variant ?? 35,
          JSON.stringify(data.completedIds ?? []),
          data.stepsDone ?? false,
        ]
      );
      return this.mapRow(result.rows[0]);
    }
  }

  private mapRow(row: any): OfpProgress {
    return {
      id: row.id,
      profile_id: row.profile_id,
      date: row.date,
      variant: row.variant,
      completed_ids: row.completed_ids ?? [],
      steps_done: row.steps_done,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}