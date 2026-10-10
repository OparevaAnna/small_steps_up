import { Router } from 'express';

const router = Router();

router.get('/advise/:date', (_req, res) => {
  res.json({ message: 'Advisor — coming soon' });
});

router.post('/rebuild-week', (_req, res) => {
  res.json({ message: 'Rebuild week — coming soon' });
});

export default router;