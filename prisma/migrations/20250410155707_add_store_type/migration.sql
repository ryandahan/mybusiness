/*
  Warnings:

  - You are about to drop the column `reasonForClosing` on the `Store` table. All the data in the column will be lost.
  - Added the required column `storeType` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Store" DROP COLUMN "reasonForClosing",
ADD COLUMN     "openingDate" TIMESTAMP(3),
ADD COLUMN     "reasonForTransition" TEXT,
ADD COLUMN     "specialOffers" TEXT,
ADD COLUMN     "storeType" TEXT NOT NULL,
ALTER COLUMN "closingDate" DROP NOT NULL,
ALTER COLUMN "discountPercentage" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StoreTip" ADD COLUMN     "storeType" TEXT NOT NULL DEFAULT 'closing';

-- CreateIndex
CREATE INDEX "Store_storeType_idx" ON "Store"("storeType");
