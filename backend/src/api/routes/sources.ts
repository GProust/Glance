import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { clerkAuthMiddleware } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../core/config/error-handling.js';
import { getProvider, supportedProvidersLabel } from '../../core/providers/registry.js';
import { ensureUserSynced } from '../../application/user.service.js';
import {
  createSource,
  listSourcesForUser,
  getSourceForUser,
  updateSource,
  deleteSource,
} from '../../infrastructure/database/source.repository.js';

const sourcesRouter = Router();

// Recurrence presets mapped to PostgreSQL INTERVAL literals (006 US3).
const RECURRENCE: Record<'hourly' | 'daily' | 'weekly', string> = {
  hourly: '1 hour',
  daily: '1 day',
  weekly: '7 days',
};

const createSchema = z.object({
  type: z.string(),
  provider: z.string(),
  display_name: z.string().min(1).max(200),
  config: z.record(z.string(), z.unknown()),
  recurrence: z.enum(['hourly', 'daily', 'weekly']).optional(),
});

const updateSchema = z.object({
  display_name: z.string().min(1).max(200).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  recurrence: z.enum(['hourly', 'daily', 'weekly']).optional(),
  is_active: z.boolean().optional(),
});

function issuesToMessage(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join('.') || '(body)'}: ${i.message}`).join('; ');
}

/** Validate a config blob against the schema for the given type/provider. */
function validateConfig(type: string, provider: string, config: unknown): Record<string, unknown> {
  const def = getProvider(type, provider);
  if (!def) {
    throw new BadRequestError(
      `Unsupported source "${type}/${provider}". Supported: ${supportedProvidersLabel()}.`,
    );
  }
  const parsed = def.configSchema.safeParse(config);
  if (!parsed.success) {
    throw new BadRequestError(`Invalid config for ${type}/${provider}: ${issuesToMessage(parsed.error)}`);
  }
  return parsed.data as Record<string, unknown>;
}

function requireUserId(req: AuthRequest): string {
  const userId = req.auth?.userId;
  if (!userId) throw new UnauthorizedError();
  return userId;
}

/** POST /api/v1/sources — register a new source. */
sourcesRouter.post('/', clerkAuthMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = requireUserId(req);
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError(issuesToMessage(parsed.error));

    const { type, provider, display_name, config, recurrence } = parsed.data;
    const validConfig = validateConfig(type, provider, config);

    // The user row must exist before we can foreign-key a source to it.
    await ensureUserSynced(userId);

    const row = await createSource({
      user_id: userId,
      type,
      provider,
      display_name,
      config: validConfig,
      // Only set when provided, so the DB column default ('1 hour') can apply otherwise.
      ...(recurrence ? { recurrence_interval: RECURRENCE[recurrence] } : {}),
    });
    res.status(201).json(row);
  } catch (error) {
    next(error);
  }
});

/** GET /api/v1/sources — list the caller's sources. */
sourcesRouter.get('/', clerkAuthMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sources = await listSourcesForUser(requireUserId(req));
    res.json({ sources });
  } catch (error) {
    next(error);
  }
});

/** GET /api/v1/sources/:id */
sourcesRouter.get('/:id', clerkAuthMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const source = await getSourceForUser(requireUserId(req), String(req.params.id));
    if (!source) throw new NotFoundError('Source not found');
    res.json(source);
  } catch (error) {
    next(error);
  }
});

/** PUT /api/v1/sources/:id — update name, config, recurrence, or active flag. */
sourcesRouter.put('/:id', clerkAuthMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = requireUserId(req);
    const id = String(req.params.id);

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError(issuesToMessage(parsed.error));

    const existing = await getSourceForUser(userId, id);
    if (!existing) throw new NotFoundError('Source not found');

    const { display_name, config, recurrence, is_active } = parsed.data;
    const patch: Parameters<typeof updateSource>[2] = {};
    if (display_name !== undefined) patch.display_name = display_name;
    if (is_active !== undefined) patch.is_active = is_active;
    if (recurrence !== undefined) patch.recurrence_interval = RECURRENCE[recurrence];
    if (config !== undefined) patch.config = validateConfig(existing.type, existing.provider, config);

    const updated = await updateSource(userId, id, patch);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/** DELETE /api/v1/sources/:id */
sourcesRouter.delete('/:id', clerkAuthMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const removed = await deleteSource(requireUserId(req), String(req.params.id));
    if (!removed) throw new NotFoundError('Source not found');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { sourcesRouter };
