export interface WeekPlan {
  id: string;
  user_id: string;
  week_start: string;          // '2026-10-05'
  rest_day: string;            // 'sunday'
  status: 'planned' | 'active' | 'completed' | 'adjusted';
  created_at: Date;
  updated_at: Date;
}

export interface DayPlan {
  id: string;
  week_plan_id: string;
  day_of_week: string;         // 'monday', 'tuesday'...
  date: string;                // '2026-10-05'
  main_workout_type: string | null;  // 'gym-lower', 'bike-easy', 'stairs'...
  main_workout_goal: string | null;
  main_workout_duration_min: number | null;
  main_workout_status: 'planned' | 'in-progress' | 'completed' | 'skipped' | 'modified';
  ofp_version: '35' | '50' | '70';
  ofp_joint_video_id: string | null;
  ofp_variable_block: string | null; // 'hip-rehab', 'neck', 'back'...
  ofp_additional_blocks: string[];   // дополнительный блоки навыков
  steps_norm_done: boolean;
  recovery_score: number | null;     // 0-100
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}