-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "isOnlineStore" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "zipCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StoreTip" ADD COLUMN     "isOnlineStore" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "website" TEXT,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "zipCode" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Store_isOnlineStore_idx" ON "Store"("isOnlineStore");

-- CreateIndex
CREATE INDEX "StoreTip_isOnlineStore_idx" ON "StoreTip"("isOnlineStore");
