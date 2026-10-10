export interface Module {
  id: string;
  key: string;
  title: string;
  category: string;
  description: string | null;
  is_obligatory: boolean;
  created_at: Date;
}

export interface UserModule {
  id: string;
  user_id: string;
  module_id: string;
  enabled: boolean;
  created_at: Date;
}