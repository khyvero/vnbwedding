-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rsvpId" INTEGER NOT NULL,
    "placeCardName" TEXT NOT NULL,
    "dietary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessName" TEXT,
    "accessCodeHash" TEXT,
    CONSTRAINT "Guest_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "RSVP" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Guest" ("accessCodeHash", "accessName", "createdAt", "dietary", "id", "placeCardName", "rsvpId") SELECT "accessCodeHash", "accessName", "createdAt", "dietary", "id", "placeCardName", "rsvpId" FROM "Guest";
DROP TABLE "Guest";
ALTER TABLE "new_Guest" RENAME TO "Guest";
CREATE INDEX "Guest_rsvpId_idx" ON "Guest"("rsvpId");
CREATE INDEX "Guest_createdAt_idx" ON "Guest"("createdAt");
CREATE TABLE "new_RSVP" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "placeCardName" TEXT,
    "email" TEXT,
    "dietary" TEXT,
    "ceremony" BOOLEAN,
    "reception" BOOLEAN,
    "transport" BOOLEAN,
    "driving" BOOLEAN,
    "printedInvite" BOOLEAN,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessName" TEXT,
    "accessCodeHash" TEXT
);
INSERT INTO "new_RSVP" ("accessCodeHash", "accessName", "ceremony", "createdAt", "dietary", "driving", "email", "id", "notes", "placeCardName", "printedInvite", "reception", "transport") SELECT "accessCodeHash", "accessName", "ceremony", "createdAt", "dietary", "driving", "email", "id", "notes", "placeCardName", "printedInvite", "reception", "transport" FROM "RSVP";
DROP TABLE "RSVP";
ALTER TABLE "new_RSVP" RENAME TO "RSVP";
CREATE INDEX "RSVP_createdAt_idx" ON "RSVP"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
