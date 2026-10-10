import { Router } from 'express';

const router = Router();

router.get('/week/:weekStart', (_req, res) => {
  res.json({ message: 'Week stats — coming soon' });
});

router.get('/coverage', (_req, res) => {
  res.json({ message: 'Coverage matrix — coming soon' });
});

export default router;