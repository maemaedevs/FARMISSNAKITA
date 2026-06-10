-- Personal information fields are optional when registering a farmer.
ALTER TABLE "Farmer" ALTER COLUMN "birthday" DROP NOT NULL;
ALTER TABLE "Farmer" ALTER COLUMN "placeOfBirth" DROP NOT NULL;
ALTER TABLE "Farmer" ALTER COLUMN "nationality" DROP NOT NULL;
ALTER TABLE "Farmer" ALTER COLUMN "occupation" DROP NOT NULL;
ALTER TABLE "Farmer" ALTER COLUMN "education" DROP NOT NULL;
ALTER TABLE "Farmer" ALTER COLUMN "primaryIncome" DROP NOT NULL;

-- Normalize legacy empty strings to NULL.
UPDATE "Farmer" SET "birthday" = NULL WHERE "birthday" = '';
UPDATE "Farmer" SET "placeOfBirth" = NULL WHERE "placeOfBirth" = '';
UPDATE "Farmer" SET "nationality" = NULL WHERE "nationality" = '';
UPDATE "Farmer" SET "occupation" = NULL WHERE "occupation" = '';
UPDATE "Farmer" SET "education" = NULL WHERE "education" = '';
UPDATE "Farmer" SET "primaryIncome" = NULL WHERE "primaryIncome" = '';

-- Ensure defaults for fields still required by the app but often unset at registration.
ALTER TABLE "Farmer" ALTER COLUMN "age" SET DEFAULT 0;
ALTER TABLE "Farmer" ALTER COLUMN "gender" SET DEFAULT '';
ALTER TABLE "Farmer" ALTER COLUMN "civilStatus" SET DEFAULT '';
ALTER TABLE "Farmer" ALTER COLUMN "householdSize" SET DEFAULT 0;
