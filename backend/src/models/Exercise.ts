// 1. Справочник Инвентаря
export interface Equipment {
  id: string;    
  title: string;
  is_home_friendly: boolean
}

// 2. Справочник Направлений (Фокусов тренировок)
export interface Topic {
  id: string;    
  title: string;  
}

// 3. Задействованные анатомические зоны
export interface BodyPart {
  id: string;    
  title: string;  
}

// 4. Развиваемые свойства и физические качества
export interface Quality {
  id: string;    
  title: string;  
}

// 5. Справочник Противопоказаний
export interface Contraindication {
  id: string;     
  title: string;  
}

// 6. Справочник Уровней приоритета / Обязательности рутины
export interface RoutineType {
  id: string;
  title: string; // например: 'Обычное', 'Обязательное ежедневное (Daily Core)'
}

// 7. Справочник Форматов нагрузки / Контекста выполнения
export interface TargetFormat {
  id: string;
  title: string; // например: 'Силовая', 'Маленькие шаги', 'Микродозинг для офиса'
}

// Перечисление возможных статусов модерации упражнения
export enum ExerciseStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  CONFIRMED = 'confirmed',
  ARCHIVED = 'archived'
}

// ГЛАВНЫЙ ИНТЕРФЕЙС УПРАЖНЕНИЯ
export interface Exercise {
  id: string;
  title: string;
  short_description: string | null;
  purpose: string[];           // массив тегов-целей
  how_to: string[];            // шаги инструкции
  image_url: string | null;
  
  // Реляционные массивы-связи
  topics: Topic[];             
  equipment: Equipment[];       
  body_parts: BodyPart[];       
  qualities: Quality[];         
  contraindications: Contraindication[]; 
  routine_types: RoutineType[];     // Уровень обязательности (🆕)
  target_formats: TargetFormat[];   // Контекст (🆕 Силовая/Шаги/Офис)
  
  difficulty: number;          // 1-5
  intensity: number;           // 1-5
  impact: number;  
  
  single_set_duration_sec: number;
  single_dose: string;         // Текст дозировки ("15 раз", "45 сек")
  
  // Умные биомеханические признаки
  is_unilateral: boolean;       // Одностороннее движение (левая/правая сторона) (🆕)
  prerequisite_exercise_id: string | null; // ID базового подводящего упражнения (🆕)
  
  status: ExerciseStatus;
  created_at: Date;
  updated_at: Date;
}