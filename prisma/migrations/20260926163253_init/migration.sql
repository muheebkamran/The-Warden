-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "targetMinutes" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DailyRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "sleepTime" TEXT,
    "wakeTime" TEXT,
    "phoneMinutes" INTEGER,
    "reflection" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GoalRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyRecordId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "targetMinutes" INTEGER NOT NULL,
    "actualMinutes" INTEGER NOT NULL DEFAULT 0,
    "showedUp" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "GoalRecord_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "DailyRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GoalRecord_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyRecord_date_key" ON "DailyRecord"("date");

-- CreateIndex
CREATE UNIQUE INDEX "GoalRecord_dailyRecordId_goalId_key" ON "GoalRecord"("dailyRecordId", "goalId");
