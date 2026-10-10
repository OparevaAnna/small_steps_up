import { Exercise } from '../models/Exercise';
import { ExerciseRepository } from '../repositories/exerciseRepository';
import { AppError } from '../middleware/errorHandler';

const exerciseRepo = new ExerciseRepository();

export class CatalogService {
  async getAll(filters?: {
    bodyParts?: string[];
    equipment?: string[];
    qualities?: string[];
    topics?: string[];
    difficulty?: number;
    impact?: number;
  }): Promise<Exercise[]> {
    if (filters && Object.keys(filters).length > 0) {
      return exerciseRepo.findByFilters(filters);
    }
    return exerciseRepo.findAll();
  }

  async getById(id: string): Promise<Exercise> {
    const exercise = await exerciseRepo.findById(id);
    if (!exercise) {
      throw new AppError(404, 'Упражнение не найдено');
    }
    return exercise;
  }
}