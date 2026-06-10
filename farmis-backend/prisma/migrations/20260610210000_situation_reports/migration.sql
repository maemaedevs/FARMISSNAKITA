-- CreateTable
CREATE TABLE "SituationReport" (
    "id" TEXT NOT NULL,
    "reportCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "imageUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "barangay" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "farmerId" TEXT NOT NULL,

    CONSTRAINT "SituationReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SituationReport_reportCode_key" ON "SituationReport"("reportCode");

-- CreateIndex
CREATE INDEX "SituationReport_farmerId_idx" ON "SituationReport"("farmerId");

-- CreateIndex
CREATE INDEX "SituationReport_status_idx" ON "SituationReport"("status");

-- CreateIndex
CREATE INDEX "SituationReport_createdAt_idx" ON "SituationReport"("createdAt");

-- AddForeignKey
ALTER TABLE "SituationReport" ADD CONSTRAINT "SituationReport_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
