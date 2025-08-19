/*
  Warnings:

  - You are about to drop the column `attending` on the `RSVP` table. All the data in the column will be lost.
  - You are about to drop the column `guestsCount` on the `RSVP` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `RSVP` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `RSVP` table. All the data in the column will be lost.
  - Added the required column `ceremony` to the `RSVP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeCardName` to the `RSVP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reception` to the `RSVP` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Guest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rsvpId" INTEGER NOT NULL,
    "placeCardName" TEXT NOT NULL,
    "dietary" TEXT,
    CONSTRAINT "Guest_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "RSVP" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RSVP" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "placeCardName" TEXT NOT NULL,
    "email" TEXT,
    "dietary" TEXT,
    "ceremony" BOOLEAN NOT NULL,
    "reception" BOOLEAN NOT NULL,
    "transport" BOOLEAN,
    "driving" BOOLEAN,
    "printedInvite" BOOLEAN,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_RSVP" ("createdAt", "email", "id") SELECT "createdAt", "email", "id" FROM "RSVP";
DROP TABLE "RSVP";
ALTER TABLE "new_RSVP" RENAME TO "RSVP";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
