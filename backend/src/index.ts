import express from 'express';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { env } from './core/config/env.config.js';
import { authRouter } from './api/routes/auth.js';
import { rateLimitMiddleware } from './api/middleware/rate-limit.js';
import { handleError } from './core/config/error-handling.js';

const app = express();

app.use(express.json());
app.use(rateLimitMiddleware as RequestHandler);

app.use('/api/v1/auth', authRouter);

// Global Error Handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const { status, body } = handleError(err);
  res.status(status).json(body);
});

app.listen(env.PORT, () => {
  console.log(`Backend server listening on port ${env.PORT}`);
});
