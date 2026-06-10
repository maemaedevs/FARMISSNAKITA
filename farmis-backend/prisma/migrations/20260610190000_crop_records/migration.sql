-- CreateTable
CREATE TABLE "CropRecord" (
    "id" TEXT NOT NULL,
    "cropCode" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "cropType" TEXT NOT NULL,
    "farmAreaHa" DOUBLE PRECISION NOT NULL,
    "plantingDate" TIMESTAMP(3) NOT NULL,
    "expectedHarvestDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'growing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "farmerId" TEXT NOT NULL,

    CONSTRAINT "CropRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CropRecord_cropCode_key" ON "CropRecord"("cropCode");

-- CreateIndex
CREATE INDEX "CropRecord_farmerId_idx" ON "CropRecord"("farmerId");

-- CreateIndex
CREATE INDEX "CropRecord_status_idx" ON "CropRecord"("status");

-- CreateIndex
CREATE INDEX "CropRecord_cropType_idx" ON "CropRecord"("cropType");

-- AddForeignKey
ALTER TABLE "CropRecord" ADD CONSTRAINT "CropRecord_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
