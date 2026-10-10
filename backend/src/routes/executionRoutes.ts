import { Router } from 'express';

const router = Router();

router.post('/start', (_req, res) => {
  res.json({ message: 'Start execution — coming soon' });
});

router.post('/complete', (_req, res) => {
  res.json({ message: 'Complete execution — coming soon' });
});

export default router;