export interface Profile {
  id: string;
  name: string;
  age_range: string;
  gender: string;
  sport: string;
  level: string;
  available_min_min: number;
  available_min_max: number;
  rest_day: string;
  impact_allowed: boolean;
  hip_load: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProfileDTO {
  name?: string;
  age_range?: string;
  gender?: string;
  sport?: string;
  level?: string;
  available_min_min?: number;
  available_min_max?: number;
  rest_day?: string;
  impact_allowed?: boolean;
  hip_load?: string;
}