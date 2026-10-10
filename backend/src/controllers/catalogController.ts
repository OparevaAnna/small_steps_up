import { Request, Response, NextFunction } from 'express';
import { CatalogService } from '../services/catalogService';

const catalogService = new CatalogService();

export class CatalogController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        bodyParts: req.query.bodyParts ? (req.query.bodyParts as string).split(',') : undefined,
        equipment: req.query.equipment ? (req.query.equipment as string).split(',') : undefined,
        qualities: req.query.qualities ? (req.query.qualities as string).split(',') : undefined,
        topics: req.query.topics ? (req.query.topics as string).split(',') : undefined,
        difficulty: req.query.difficulty ? Number(req.query.difficulty) : undefined,
        impact: req.query.impact ? Number(req.query.impact) : undefined,
      };
      
      const exercises = await catalogService.getAll(filters);
      res.json(exercises);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const exercise = await catalogService.getById(id);
      res.json(exercise);
    } catch (err) {
      next(err);
    }
  }
}