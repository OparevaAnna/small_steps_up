import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Video library — coming soon' });
});

router.get('/:id', (_req, res) => {
  res.json({ message: 'Video detail — coming soon' });
});

export default router;