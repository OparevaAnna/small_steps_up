export interface Video {
  id: string;
  title: string;
  source_type: 'upload' | 'url';
  url: string;
  duration_minutes: number;
  environment: 'standing-and-mat' | 'standing-only';
  requires_mat: boolean;
  status: 'active' | 'inactive';
  last_used_at: Date | null;
  usage_count: number;
  tags: string[];
  created_at: Date;
}