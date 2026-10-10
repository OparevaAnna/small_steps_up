export interface ExerciseClip {
  id: string;
  exercise_id: string;
  video_id: string;
  start_sec: number | null;
  end_sec: number | null;
  sort_order: number;
  created_at: Date;
}