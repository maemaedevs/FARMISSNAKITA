-- CreateTable
CREATE TABLE "AssistanceDistribution" (
    "id" TEXT NOT NULL,
    "distributionCode" TEXT NOT NULL,
    "assistanceType" TEXT NOT NULL,
    "quantityLabel" TEXT NOT NULL,
    "amountPeso" DOUBLE PRECISION NOT NULL,
    "distributedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "distributedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "programId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,

    CONSTRAINT "AssistanceDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssistanceDistribution_distributionCode_key" ON "AssistanceDistribution"("distributionCode");

-- CreateIndex
CREATE INDEX "AssistanceDistribution_programId_idx" ON "AssistanceDistribution"("programId");

-- CreateIndex
CREATE INDEX "AssistanceDistribution_farmerId_idx" ON "AssistanceDistribution"("farmerId");

-- CreateIndex
CREATE INDEX "AssistanceDistribution_status_idx" ON "AssistanceDistribution"("status");

-- AddForeignKey
ALTER TABLE "AssistanceDistribution" ADD CONSTRAINT "AssistanceDistribution_programId_fkey" FOREIGN KEY ("programId") REFERENCES "AssistanceProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistanceDistribution" ADD CONSTRAINT "AssistanceDistribution_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
