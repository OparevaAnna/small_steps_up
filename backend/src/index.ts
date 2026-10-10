import app from './app';
import { env } from './config/env';

const server = app.listen(env.port, () => {
  console.log(`🌲 Small Steps Up API running on port ${env.port}`);
  console.log(`   Environment: ${env.nodeEnv}`);
  console.log(`   CORS origin: ${env.cors.origin}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});