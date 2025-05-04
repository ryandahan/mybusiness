/*
  Warnings:

  - You are about to drop the column `reasonForTransition` on the `Store` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Store" DROP COLUMN "reasonForTransition",
ADD COLUMN     "reasonForClosing" TEXT,
ALTER COLUMN "storeType" DROP NOT NULL;

-- CreateTable
CREATE TABLE "StoreImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreTipImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storeTipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreTipImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreImage_storeId_idx" ON "StoreImage"("storeId");

-- CreateIndex
CREATE INDEX "StoreTipImage_storeTipId_idx" ON "StoreTipImage"("storeTipId");

-- AddForeignKey
ALTER TABLE "StoreImage" ADD CONSTRAINT "StoreImage_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreTipImage" ADD CONSTRAINT "StoreTipImage_storeTipId_fkey" FOREIGN KEY ("storeTipId") REFERENCES "StoreTip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
