import { CreateProfileDTO, Profile } from '../models/Profile';
import { ProfileRepository } from '../repositories/profileRepository';
import { AppError } from '../middleware/errorHandler';

const profileRepo = new ProfileRepository();

export class ProfileService {
  async getProfile(): Promise<Profile> {
    const profile = await profileRepo.findFirst();
    if (!profile) {
      throw new AppError(404, 'Профиль не найден. Выполните seed базы данных.');
    }
    return profile;
  }

  async updateProfile(data: Partial<CreateProfileDTO>): Promise<Profile> {
    const profile = await profileRepo.findFirst();
    if (!profile) {
      throw new AppError(404, 'Профиль не найден');
    }
    return profileRepo.update(profile.id, data);
  }
}