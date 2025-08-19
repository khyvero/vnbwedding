-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rsvpId" INTEGER NOT NULL,
    "placeCardName" TEXT NOT NULL,
    "dietary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessName" TEXT,
    "accessCodeHash" TEXT,
    CONSTRAINT "Guest_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "RSVP" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Guest" ("accessCodeHash", "accessName", "dietary", "id", "placeCardName", "rsvpId") SELECT "accessCodeHash", "accessName", "dietary", "id", "placeCardName", "rsvpId" FROM "Guest";
DROP TABLE "Guest";
ALTER TABLE "new_Guest" RENAME TO "Guest";
CREATE INDEX "Guest_rsvpId_idx" ON "Guest"("rsvpId");
CREATE INDEX "Guest_createdAt_idx" ON "Guest"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
