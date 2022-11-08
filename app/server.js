import http from 'http';
import mongoose from 'mongoose';

import app from './index.js';
import { logger } from './middlewares/index.js';

const PORT = process.env.PORT ?? 3000;
const server = http.createServer(app.callback());

const gracefulShutdown = (msg) => {
  logger.info(`Shutdown initiated: ${msg}`);
  mongoose.connection.close(false, () => {
    logger.info('MongoDB closed');
    server.close(() => {
      logger.info('Shutting down...');
      process.exit();
    });
  });
};

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`✨ Running on port: ${PORT}`);

  /**
   * Handle Kill Commands
   */
  process.on('SIGTERM', gracefulShutdown);

  /**
   * Handle Interrupts
   */
  process.on('SIGINT', gracefulShutdown);

  /**
   * Prevent Dirty Exit On Uncaught Exceptions:
   */
  process.on('uncaughtException', gracefulShutdown);

  /**
   * Prevent Dirty Exit On Unhandled Promise Rejection
   */
  process.on('uncaughtRejection', gracefulShutdown);
});
