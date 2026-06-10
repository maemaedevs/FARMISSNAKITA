import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import {
  buildDevReportsOverview,
  buildReportsOverview,
} from '../services/reports.service';

function isPrismaDbUnavailable(err: unknown) {
  const code = (err as { code?: string })?.code;
  return (
    code === 'P1000' ||
    code === 'P1001' ||
    code === 'P1002' ||
    code === 'P1012' ||
    code === 'P1017' ||
    code === 'P2021'
  );
}

const reportsQuerySchema = z.object({
  programType: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

async function getReportsOverview(req: Request) {
  const q = reportsQuerySchema.parse(req.query);
  return buildReportsOverview({
    programType: q.programType,
    page: q.page,
    pageSize: q.pageSize,
  });
}

export async function getAdminReportsOverview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    try {
      const overview = await getReportsOverview(req);
      return res.json(overview);
    } catch (err) {
      if (!isPrismaDbUnavailable(err)) throw err;
      const overview = buildDevReportsOverview(
        reportsQuerySchema.parse(req.query),
      );
      return res.json(overview);
    }
  } catch (err) {
    return next(err);
  }
}

export async function getMobileReportsOverview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    try {
      const overview = await getReportsOverview(req);
      return res.json(overview);
    } catch (err) {
      if (!isPrismaDbUnavailable(err)) throw err;
      const overview = buildDevReportsOverview(
        reportsQuerySchema.parse(req.query),
      );
      return res.json(overview);
    }
  } catch (err) {
    return next(err);
  }
}
