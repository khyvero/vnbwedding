-- DropIndex
DROP INDEX "Guest_accessCodeHash_idx";

-- CreateTable
CREATE TABLE "Invite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rsvpId" INTEGER,
    "guestId" INTEGER,
    "accessName" TEXT,
    "accessCodeHash" TEXT,
    "canViewPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invite_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "RSVP" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invite_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RSVP" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "placeCardName" TEXT NOT NULL,
    "email" TEXT,
    "dietary" TEXT,
    "ceremony" BOOLEAN NOT NULL DEFAULT false,
    "reception" BOOLEAN NOT NULL DEFAULT false,
    "transport" BOOLEAN,
    "driving" BOOLEAN,
    "printedInvite" BOOLEAN,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessName" TEXT,
    "accessCodeHash" TEXT
);
INSERT INTO "new_RSVP" ("accessCodeHash", "accessName", "ceremony", "createdAt", "dietary", "driving", "email", "id", "notes", "placeCardName", "printedInvite", "reception", "transport") SELECT "accessCodeHash", "accessName", "ceremony", "createdAt", "dietary", "driving", "email", "id", "notes", "placeCardName", "printedInvite", "reception", "transport" FROM "RSVP";
DROP TABLE "RSVP";
ALTER TABLE "new_RSVP" RENAME TO "RSVP";
CREATE INDEX "RSVP_createdAt_idx" ON "RSVP"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Invite_rsvpId_key" ON "Invite"("rsvpId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_guestId_key" ON "Invite"("guestId");
