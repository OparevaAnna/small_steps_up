import pool from '../config/database';
import { Profile, CreateProfileDTO } from '../models/Profile';

export class ProfileRepository {
  async findById(id: string): Promise<Profile | null> {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findFirst(): Promise<Profile | null> {
    const result = await pool.query(
      'SELECT * FROM profiles ORDER BY created_at ASC LIMIT 1'
    );
    return result.rows[0] || null;
  }

  async update(id: string, data: Partial<CreateProfileDTO>): Promise<Profile> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    fields.push(`updated_at = now()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE profiles SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async create(data: CreateProfileDTO): Promise<Profile> {
    const result = await pool.query(
      `INSERT INTO profiles (name, age_range, gender, sport, level, available_min_min, available_min_max, rest_day, impact_allowed, hip_load)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.name || 'mauta',
        data.age_range || '40-49',
        data.gender || 'female',
        data.sport || 'trail-running',
        data.level || 'intermediate',
        data.available_min_min || 60,
        data.available_min_max || 120,
        data.rest_day || 'sunday',
        data.impact_allowed || false,
        data.hip_load || 'limited',
      ]
    );
    return result.rows[0];
  }
}