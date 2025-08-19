-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rsvpId" INTEGER,
    "guestId" INTEGER,
    "accessName" TEXT,
    "accessCodeHash" TEXT,
    "canViewPrivate" BOOLEAN NOT NULL DEFAULT false,
    "group" TEXT NOT NULL DEFAULT 'guest',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invite_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "RSVP" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invite_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Invite" ("accessCodeHash", "accessName", "canViewPrivate", "createdAt", "guestId", "id", "rsvpId", "updatedAt") SELECT "accessCodeHash", "accessName", "canViewPrivate", "createdAt", "guestId", "id", "rsvpId", "updatedAt" FROM "Invite";
DROP TABLE "Invite";
ALTER TABLE "new_Invite" RENAME TO "Invite";
CREATE UNIQUE INDEX "Invite_rsvpId_key" ON "Invite"("rsvpId");
CREATE UNIQUE INDEX "Invite_guestId_key" ON "Invite"("guestId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
