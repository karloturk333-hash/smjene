-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "hours" REAL NOT NULL,
    "tipsCash" REAL NOT NULL DEFAULT 0,
    "tipsCard" REAL NOT NULL DEFAULT 0,
    "venue" TEXT,
    "note" TEXT,
    "guests" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Shift" ("createdAt", "date", "endTime", "hours", "id", "note", "startTime", "tipsCard", "tipsCash", "updatedAt", "venue") SELECT "createdAt", "date", "endTime", "hours", "id", "note", "startTime", "tipsCard", "tipsCash", "updatedAt", "venue" FROM "Shift";
DROP TABLE "Shift";
ALTER TABLE "new_Shift" RENAME TO "Shift";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
