import { Router } from 'express';
import { OfpController } from '../controllers/ofpController';

const router = Router();
const controller = new OfpController();

router.get('/progress', (req, res, next) => controller.getProgress(req, res, next));
router.post('/progress', (req, res, next) => controller.saveProgress(req, res, next));
router.get('/daily-ofp', (req, res, next) => controller.getDailyOfp(req, res, next));

export default router;