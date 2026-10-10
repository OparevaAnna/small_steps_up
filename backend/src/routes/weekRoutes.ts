import { Router } from 'express';

const router = Router();

router.get('/current', (_req, res) => {
  res.json({ message: 'Week routes — coming soon' });
});

router.get('/:weekStart', (_req, res) => {
  res.json({ message: 'Week detail — coming soon' });
});

router.patch('/:weekStart', (_req, res) => {
  res.json({ message: 'Week update — coming soon' });
});

export default router;