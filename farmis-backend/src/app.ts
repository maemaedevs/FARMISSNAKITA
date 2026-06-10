import path from 'path';

import express from 'express';

import cors from 'cors';

import { env } from './lib/env';
import { errorHandler } from './middleware/error';

import { authRouter } from './routes/auth.routes';
import { adminRouter } from './routes/admin.routes';
import { mobileRouter } from './routes/mobile.routes';
import { healthRouter } from './routes/health.routes';
import { docsRouter } from './routes/docs.routes';

export const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api', docsRouter);
app.use('/api', healthRouter);
app.use('/api', authRouter);
app.use('/api', adminRouter);
app.use('/api', mobileRouter);

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use(errorHandler);

