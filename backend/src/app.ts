import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Route imports
import profileRoutes from './routes/profileRoutes';
import weekRoutes from './routes/weekRoutes';
import todayRoutes from './routes/todayRoutes';
import catalogRoutes from './routes/catalogRoutes';
import advisorRoutes from './routes/advisorRoutes';
import videoRoutes from './routes/videoRoutes';
import executionRoutes from './routes/executionRoutes';
import ofpRoutes from './routes/ofpRoutes';
import statsRoutes from './routes/statsRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: env.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/week', weekRoutes);
app.use('/api/today', todayRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/execution', executionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ofp', ofpRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;