import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // During `prisma generate` Prisma config cannot rely on a `.env` being present.
    // Use a sane local default and override via real DATABASE_URL.
    url:
      process.env.DATABASE_URL ??
      'postgresql://farmis:farmis@localhost:5432/farmis?schema=public',
  },
  // Allow using the TS seed script without additional flags.
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});

