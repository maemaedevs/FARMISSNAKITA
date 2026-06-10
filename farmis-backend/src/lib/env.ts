import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CORS_ORIGINS: z
    .string()
    .optional()
    .transform((val) =>
      val && val.trim().length > 0
        ? val.split(',').map((s) => s.trim())
        : ['http://localhost:5173'],
    ),
  OTP_TTL_SECONDS: z.coerce.number().default(300),
  OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(4),
  OTP_MAX_VERIFY_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(5),
});

const parsed = EnvSchema.parse(process.env);

export const env = parsed;
