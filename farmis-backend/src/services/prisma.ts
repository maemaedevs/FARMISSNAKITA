import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import { env } from '../lib/env';

// Prevent exhausting DB connections during dev reloads.
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const pgAdapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: pgAdapter,
    log: ['error'],
  });

if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

