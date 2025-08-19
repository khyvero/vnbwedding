/*
  Warnings:

  - A unique constraint covering the columns `[accessName]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accessCodeHash]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Invite_accessName_key" ON "Invite"("accessName");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_accessCodeHash_key" ON "Invite"("accessCodeHash");
