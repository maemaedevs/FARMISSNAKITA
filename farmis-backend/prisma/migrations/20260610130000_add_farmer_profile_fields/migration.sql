-- AlterTable
ALTER TABLE "Farmer" ADD COLUMN IF NOT EXISTS "alternativeContact" TEXT,
ADD COLUMN IF NOT EXISTS "organization" TEXT,
ADD COLUMN IF NOT EXISTS "registeredBeneficiary" BOOLEAN NOT NULL DEFAULT false;
