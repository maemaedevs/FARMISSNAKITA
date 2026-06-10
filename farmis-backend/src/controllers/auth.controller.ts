import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { prisma } from '../services/prisma';
import { issueAdminToken, issueClientToken } from '../services/token.service';
import { requestOtp, verifyOtp } from '../services/otp.service';
import { AppError } from '../middleware/error';
import { DEV_FARMERS } from '../services/dev-data';

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

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const body = adminLoginSchema.parse(req.body);

    let user:
      | (Awaited<ReturnType<typeof prisma.adminUser.findUnique>>)
      | null = null;

    try {
      user = await prisma.adminUser.findUnique({
        where: { email: body.email },
      });
    } catch (err) {
      // Development fallback: if Postgres credentials are not configured
      // (no migrations / no DB yet), let the admin UI still log in so
      // you can work on the frontend contract.
      const code = (err as any)?.code;
      const isDbAuthError = code === 'P1000'; // invalid credentials

      if (
        isDbAuthError &&
        body.email === 'admin@farmis.local' &&
        body.password === 'admin123'
      ) {
        const token = issueAdminToken({ sub: 'usr_admin_001' });

        return res.json({
          token,
          user: {
            id: 'usr_admin_001',
            name: 'Farmis Admin',
            email: body.email,
            role: 'admin',
            createdAt: new Date().toISOString(),
          },
        });
      }

      throw err;
    }

    if (!user || user.status !== 'active') throw new AppError(401, 'Invalid email or password');

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      throw new AppError(401, 'Invalid email or password');
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = issueAdminToken({ sub: user.id });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin',
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    return next(err);
  }
}

const registerAdminSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = registerAdminSchema.parse(req.body);

    const existing = await prisma.adminUser.findUnique({
      where: { email: body.email },
    });
    if (existing) {
      throw new AppError(409, 'An admin with this email already exists');
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.adminUser.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        role: 'admin',
        status: 'active',
      },
    });

    res.status(201);
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'admin',
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    return next(err);
  }
}

const mobileLoginSchema = z.object({
  farmerId: z.string().min(1),
  password: z.string().min(6),
});

/** Default dev password when Postgres is unavailable (FARM-0001). */
const DEV_FARMER_PASSWORD = 'farmer123';

export async function loginMobileByFarmerId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = mobileLoginSchema.parse(req.body);
    const farmerId = body.farmerId.trim();

    try {
      const farmer = await prisma.farmer.findFirst({
        where: {
          OR: [{ farmerCode: farmerId }, { registryId: farmerId }],
        },
        select: {
          id: true,
          farmerCode: true,
          name: true,
          barangay: true,
          contactNumber: true,
          status: true,
          passwordHash: true,
        },
      });

      if (!farmer || farmer.status !== 'active') {
        throw new AppError(401, 'Invalid Farmer ID or password');
      }

      if (!farmer.passwordHash) {
        throw new AppError(
          401,
          'No mobile password set for this farmer. Ask your Municipal Agriculture Office to generate one.',
        );
      }

      const ok = await bcrypt.compare(body.password, farmer.passwordHash);
      if (!ok) {
        throw new AppError(401, 'Invalid Farmer ID or password');
      }

      const token = issueClientToken({ sub: farmer.id });
      return res.json({
        token,
        user: {
          id: farmer.id,
          farmerCode: farmer.farmerCode,
          name: farmer.name,
          barangay: farmer.barangay,
          contactNumber: farmer.contactNumber,
          status: farmer.status,
        },
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (!isPrismaDbUnavailable(err)) throw err;

      // Dev fallback: DB unavailable, match against in-memory dev farmers.
      const dev = DEV_FARMERS.find(
        (f) => f.farmerCode === farmerId || f.registryId === farmerId,
      );
      if (!dev || dev.status !== 'active') {
        throw new AppError(401, 'Invalid Farmer ID or password');
      }

      if (body.password !== DEV_FARMER_PASSWORD) {
        throw new AppError(401, 'Invalid Farmer ID or password');
      }

      const token = issueClientToken({ sub: dev.id });
      return res.json({
        token,
        user: {
          id: dev.id,
          farmerCode: dev.farmerCode,
          name: dev.name,
          barangay: dev.barangay,
          contactNumber: dev.contactNumber,
          status: dev.status,
        },
      });
    }
  } catch (err) {
    return next(err);
  }
}

const requestOtpSchema = z.object({
  phoneNumber: z.string().min(7),
});

export async function requestOtpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = requestOtpSchema.parse(req.body);
    await requestOtp({
      phoneNumber: body.phoneNumber,
      ip: req.ip ?? 'unknown',
    });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(7),
  otp: z.string().min(4),
});

export async function verifyOtpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = verifyOtpSchema.parse(req.body);
    const session = await verifyOtp({
      phoneNumber: body.phoneNumber,
      otp: body.otp,
      ip: req.ip ?? 'unknown',
    });
    return res.json(session);
  } catch (err) {
    return next(err);
  }
}

