import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';

const router = Router();
const controller = new ProfileController();

router.get('/', controller.get.bind(controller));
router.patch('/', controller.update.bind(controller));

export default router;