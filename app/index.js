import cors from 'koa2-cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'koa-helmet';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import { error, logger, responseTime } from './middlewares/index.js';
import routes from './routes/index.js';

dotenv.config();

const app = new Koa();

mongoose.connect(process.env.MONGO_URL, {
  bufferCommands: false,
  family: 4,
});

const db = mongoose.connection;

db.on('error', (err) => {
  logger.error(err);
})
  .once('connected', () => {
    logger.info('🔗 MongoDB connected');
    app.emit('ready');
  })
  .on('reconnected', () => {
    logger.info('🔗 MongoDB re-connected');
  })
  .on('disconnected', () => {
    logger.info('Mongo disconnected');
  });

// disable console.errors for pino
app.silent = true;

// Error handler
app.use(error);

app.use(bodyParser());

app.use(helmet());

app.use(
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowHeaders: ['Content-Type', 'Accept'],
  }),
);

// Set header with API response time
app.use(responseTime);

// Register routes
app.use(await routes());

export default app;
