-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RSVP" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "placeCardName" TEXT NOT NULL,
    "email" TEXT,
    "dietary" TEXT,
    "ceremony" BOOLEAN,
    "reception" BOOLEAN,
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
