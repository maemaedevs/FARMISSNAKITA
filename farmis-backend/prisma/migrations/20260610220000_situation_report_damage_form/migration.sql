-- AlterTable
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "fullName" TEXT;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "contactNumber" TEXT;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "incidentTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "incidentOther" TEXT;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "incidentAt" TIMESTAMP(3);
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "sitioPurok" TEXT;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "mapLatitude" DOUBLE PRECISION;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "mapLongitude" DOUBLE PRECISION;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "cropType" TEXT;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "estimatedAreaHa" DOUBLE PRECISION;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "estimatedLossPeso" DOUBLE PRECISION;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "damageDescription" TEXT;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "photoCropUrl" TEXT;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "photoLandslideUrl" TEXT;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "photoOtherUrl" TEXT;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "docProofOfLand" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "docListOfCrops" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "docValidId" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "docOther" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "documentUrl" TEXT;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "documentName" TEXT;
ALTER TABLE "SituationReport" ADD COLUMN IF NOT EXISTS "declared" BOOLEAN NOT NULL DEFAULT false;

UPDATE "SituationReport"
SET
  "fullName" = COALESCE("fullName", 'Unknown'),
  "contactNumber" = COALESCE("contactNumber", ''),
  "address" = COALESCE("address", ''),
  "incidentAt" = COALESCE("incidentAt", "createdAt"),
  "sitioPurok" = COALESCE("sitioPurok", ''),
  "cropType" = COALESCE("cropType", "title"),
  "estimatedAreaHa" = COALESCE("estimatedAreaHa", 0),
  "estimatedLossPeso" = COALESCE("estimatedLossPeso", 0),
  "damageDescription" = COALESCE("damageDescription", "description"),
  "photoCropUrl" = COALESCE("photoCropUrl", "imageUrl")
WHERE "fullName" IS NULL;

ALTER TABLE "SituationReport" ALTER COLUMN "fullName" SET NOT NULL;
ALTER TABLE "SituationReport" ALTER COLUMN "contactNumber" SET NOT NULL;
ALTER TABLE "SituationReport" ALTER COLUMN "address" SET NOT NULL;
ALTER TABLE "SituationReport" ALTER COLUMN "incidentAt" SET NOT NULL;
ALTER TABLE "SituationReport" ALTER COLUMN "sitioPurok" SET NOT NULL;
ALTER TABLE "SituationReport" ALTER COLUMN "cropType" SET NOT NULL;
ALTER TABLE "SituationReport" ALTER COLUMN "estimatedAreaHa" SET NOT NULL;
ALTER TABLE "SituationReport" ALTER COLUMN "estimatedLossPeso" SET NOT NULL;
ALTER TABLE "SituationReport" ALTER COLUMN "damageDescription" SET NOT NULL;
