export interface ExecutionLog {
  id: string;
  day_plan_id: string;
  block_type: 'main-workout' | 'ofp-joint' | 'ofp-core' | 'ofp-variable' | 'ofp-extra' | 'stretching' | 'mfr';
  exercise_id: string | null;
  started_at: Date;
  completed_at: Date | null;
  duration_seconds: number | null;
  stopped_early: boolean;
  discomfort: boolean;
  rpe: number | null;             // 1-10
  notes: string | null;
  created_at: Date;
}

export interface CoreTimerSettings {
  id: string;
  user_id: string;
  title: string;
  work_seconds: number;
  rest_seconds: number;
  exercise_count: number;
  rounds: number;
  preparation_seconds: number;
  rest_between_rounds_seconds: number;
  updated_at: Date;
}