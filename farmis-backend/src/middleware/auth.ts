import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../lib/env';
import { AppError } from './error';

export type JwtRole = 'admin' | 'client';

export type JwtUser = {
  sub: string;
  role: JwtRole;
};

declare global {
  namespace Express {
    interface Request {
      auth?: JwtUser;
    }
  }
}

export function authenticateJwt(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('Authorization');
  if (!header) {
    return next(new AppError(401, 'Missing Authorization header'));
  }

  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return next(new AppError(401, 'Invalid Authorization header'));
  }

  const token = match[1]!;
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    if (!payload?.sub || typeof payload.sub !== 'string') {
      return next(new AppError(401, 'Invalid token payload'));
    }

    const role = payload.role;
    if (role !== 'admin' && role !== 'client') {
      return next(new AppError(401, 'Invalid token role'));
    }

    req.auth = { sub: payload.sub, role };
    return next();
  } catch {
    return next(new AppError(401, 'Invalid or expired token'));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) return next(new AppError(401, 'Unauthenticated'));
  if (req.auth.role !== 'admin') return next(new AppError(403, 'Forbidden'));
  return next();
}

export function requireClient(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) return next(new AppError(401, 'Unauthenticated'));
  if (req.auth.role !== 'client') return next(new AppError(403, 'Forbidden'));
  return next();
}

