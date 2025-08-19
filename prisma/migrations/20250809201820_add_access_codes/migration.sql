-- AlterTable
ALTER TABLE "Guest" ADD COLUMN "accessCodeHash" TEXT;
ALTER TABLE "Guest" ADD COLUMN "accessName" TEXT;

-- AlterTable
ALTER TABLE "RSVP" ADD COLUMN "accessCodeHash" TEXT;
ALTER TABLE "RSVP" ADD COLUMN "accessName" TEXT;

-- CreateIndex
CREATE INDEX "Guest_accessCodeHash_idx" ON "Guest"("accessCodeHash");

-- CreateIndex
CREATE INDEX "RSVP_accessCodeHash_idx" ON "RSVP"("accessCodeHash");
