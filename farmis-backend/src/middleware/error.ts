import type { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      message: err.message,
      details: err.details,
    });
  }

  console.error(err);
  return res.status(500).json({
    message: 'Internal server error',
  });
}

