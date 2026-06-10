-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemUser" (
    "id" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farmer" (
    "id" TEXT NOT NULL,
    "farmerCode" TEXT NOT NULL,
    "registryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT,
    "barangay" TEXT NOT NULL,
    "farmAreaHa" DOUBLE PRECISION NOT NULL,
    "primaryCrops" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "civilStatus" TEXT NOT NULL,
    "birthday" TEXT NOT NULL,
    "placeOfBirth" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "householdSize" INTEGER NOT NULL,
    "primaryIncome" TEXT NOT NULL,
    "farmingExperienceYears" INTEGER NOT NULL,
    "mainCrop" TEXT NOT NULL,
    "otherCrops" TEXT NOT NULL,
    "livestock" TEXT NOT NULL,
    "farmingType" TEXT NOT NULL,
    "farmSizeHa" DOUBLE PRECISION NOT NULL,
    "landLocation" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "landType" TEXT NOT NULL,
    "titleNo" TEXT NOT NULL,
    "verifiedBy" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmerLandDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "farmerId" TEXT NOT NULL,

    CONSTRAINT "FarmerLandDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistanceProgram" (
    "id" TEXT NOT NULL,
    "programCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "programType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetBeneficiaries" INTEGER NOT NULL,
    "fundingSource" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "icon" TEXT NOT NULL,

    CONSTRAINT "AssistanceProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attemptsRemaining" INTEGER NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'sms',
    "purpose" TEXT NOT NULL DEFAULT 'mobile_login',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MobileUser" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "name" TEXT,
    "avatarUri" TEXT,
    "pinCodeHash" TEXT,
    "locale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobileUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SystemUser_userCode_key" ON "SystemUser"("userCode");

-- CreateIndex
CREATE UNIQUE INDEX "SystemUser_username_key" ON "SystemUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_farmerCode_key" ON "Farmer"("farmerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_registryId_key" ON "Farmer"("registryId");

-- CreateIndex
CREATE INDEX "FarmerLandDocument_farmerId_idx" ON "FarmerLandDocument"("farmerId");

-- CreateIndex
CREATE UNIQUE INDEX "AssistanceProgram_programCode_key" ON "AssistanceProgram"("programCode");

-- CreateIndex
CREATE INDEX "OtpCode_phoneNumber_expiresAt_idx" ON "OtpCode"("phoneNumber", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "MobileUser_phoneNumber_key" ON "MobileUser"("phoneNumber");

-- AddForeignKey
ALTER TABLE "FarmerLandDocument" ADD CONSTRAINT "FarmerLandDocument_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
