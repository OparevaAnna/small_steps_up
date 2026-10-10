import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profileService';

const profileService = new ProfileService();

export class ProfileController {
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await profileService.getProfile();
      res.json(profile);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await profileService.updateProfile(req.body);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  }
}