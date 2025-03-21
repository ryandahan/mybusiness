-- CreateIndex
CREATE INDEX "Store_isApproved_createdAt_idx" ON "Store"("isApproved", "createdAt");

-- CreateIndex
CREATE INDEX "Store_isFeatured_idx" ON "Store"("isFeatured");

-- CreateIndex
CREATE INDEX "Store_city_state_idx" ON "Store"("city", "state");
