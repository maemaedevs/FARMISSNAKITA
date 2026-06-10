import { randomInt } from 'crypto';

import bcrypt from 'bcryptjs';

import { env } from '../lib/env';
import { AppError } from '../middleware/error';
import { prisma } from './prisma';
import { issueClientToken } from './token.service';

type RequestOtpParams = {
  phoneNumber: string;
  ip: string;
};

type VerifyOtpParams = {
  phoneNumber: string;
  otp: string;
  ip: string;
};

// Simple in-memory rate limiter (adequate for single-instance dev).
const otpRequestLimiter = new Map<
  string,
  { count: number; resetAt: number }
>();

function normalizePhoneNumber(input: string) {
  const trimmed = input.trim();
  const normalized = trimmed.replace(/[^\d+]/g, '');
  return normalized.startsWith('+') ? normalized.slice(1) : normalized;
}

function generateNumericOtp(length: number): string {
  let otp = '';
  for (let i = 0; i < length; i += 1) {
    otp += randomInt(0, 10).toString();
  }
  return otp;
}

function logOtpToConsole(phoneNumber: string, otp: string): void {
  const ttlMin = Math.max(1, Math.round(env.OTP_TTL_SECONDS / 60));
  console.warn(
    `[OTP] sms recipient=${phoneNumber} code=${otp} expiresIn=${ttlMin}m (dev: console delivery)`,
  );
}

/** When Postgres is down, verify accepts this (length matches env.OTP_LENGTH). */
function devFallbackOtpCode(length: number): string {
  const base = '1234';
  if (length <= base.length) return base.slice(0, length);
  return base.padStart(length, '0');
}

export async function requestOtp({ phoneNumber, ip }: RequestOtpParams) {
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!/^\d{7,15}$/.test(normalized)) {
    throw new AppError(400, 'Invalid phone number format');
  }

  const key = `${normalized}|${ip}`;
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 5;

  const existing = otpRequestLimiter.get(key);
  if (!existing || now >= existing.resetAt) {
    otpRequestLimiter.set(key, { count: 1, resetAt: now + windowMs });
  } else if (existing.count >= maxRequests) {
    throw new AppError(429, 'Too many OTP requests. Try again later.');
  } else {
    existing.count += 1;
    otpRequestLimiter.set(key, existing);
  }

  const otp = generateNumericOtp(env.OTP_LENGTH);
  const codeHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + env.OTP_TTL_SECONDS * 1000);

  try {
    await prisma.otpCode.create({
      data: {
        phoneNumber: normalized,
        codeHash,
        expiresAt,
        usedAt: null,
        attemptsRemaining: env.OTP_MAX_VERIFY_ATTEMPTS,
        channel: 'sms',
        purpose: 'mobile_login',
      },
    });
  } catch (err) {
    if (isPrismaDbUnavailable(err)) {
      const devCode = devFallbackOtpCode(env.OTP_LENGTH);
      console.warn(
        '[OTP] Postgres unavailable — OTP not persisted. Start DB: `docker compose up -d` then `npm run prisma:migrate`.',
      );
      logOtpToConsole(normalized, devCode);
      return;
    }
    throw err;
  }

  logOtpToConsole(normalized, otp);
}

export async function verifyOtp({
  phoneNumber,
  otp,
  ip: _ip,
}: VerifyOtpParams) {
  const normalized = normalizePhoneNumber(phoneNumber);
  const trimmedOtp = otp.trim();
  const len = env.OTP_LENGTH;

  if (!new RegExp(`^\\d{${len}}$`).test(trimmedOtp)) {
    throw new AppError(400, `OTP must be ${len} digits`);
  }

  let otpRecord: {
    id: string;
    codeHash: string;
    attemptsRemaining: number;
  } | null = null;

  try {
    const row = await prisma.otpCode.findFirst({
      where: {
        phoneNumber: normalized,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        codeHash: true,
        attemptsRemaining: true,
      },
    });
    otpRecord = row;
  } catch (err) {
    if (isPrismaDbUnavailable(err)) {
      if (trimmedOtp !== devFallbackOtpCode(len)) {
        throw new AppError(400, 'Invalid or expired OTP');
      }

      const mobileUser = await prisma.mobileUser
        .upsert({
          where: { phoneNumber: normalized },
          update: {},
          create: { phoneNumber: normalized, name: null, avatarUri: null },
        })
        .catch(() => ({
          id: `mobile_${normalized}`,
          phoneNumber: normalized,
        }));

      const token = issueClientToken({ sub: mobileUser.id });
      return {
        token,
        user: {
          id: mobileUser.id,
          phoneNumber: mobileUser.phoneNumber,
        },
      };
    }
    throw err;
  }

  if (!otpRecord) {
    throw new AppError(400, 'Invalid or expired OTP');
  }

  if (otpRecord.attemptsRemaining <= 0) {
    throw new AppError(429, 'OTP attempt limit reached');
  }

  const ok = await bcrypt.compare(trimmedOtp, otpRecord.codeHash);
  if (!ok) {
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { attemptsRemaining: otpRecord.attemptsRemaining - 1 },
    });
    throw new AppError(400, 'Invalid or expired OTP');
  }

  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { usedAt: new Date() },
  });

  const mobileUser = await prisma.mobileUser.upsert({
    where: { phoneNumber: normalized },
    update: {},
    create: { phoneNumber: normalized, name: null, avatarUri: null },
  });

  const token = issueClientToken({ sub: mobileUser.id });
  return {
    token,
    user: {
      id: mobileUser.id,
      phoneNumber: mobileUser.phoneNumber,
    },
  };
}

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
