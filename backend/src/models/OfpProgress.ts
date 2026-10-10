export interface OfpProgress {
  id: string;
  profile_id: string;
  date: string;
  variant: number;
  completed_ids: string[];
  steps_done: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SaveOfpProgressDTO {
  date: string;
  variant?: number;
  completedIds?: string[];
  stepsDone?: boolean;
}