-- ==============================================================================
-- Cloudflare D1 Database Schema for Accountability OS
-- Managed Serverless SQLite Migration
-- ==============================================================================

-- Create Goal Table (Habits / Disciplines)
CREATE TABLE IF NOT EXISTS "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "targetMinutes" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Daily Record Table
CREATE TABLE IF NOT EXISTS "DailyRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "sleepTime" TEXT,
    "wakeTime" TEXT,
    "phoneMinutes" INTEGER,
    "reflection" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Goal Record Table (Completion status & actual minutes)
CREATE TABLE IF NOT EXISTS "GoalRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyRecordId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "targetMinutes" INTEGER NOT NULL,
    "actualMinutes" INTEGER NOT NULL DEFAULT 0,
    "showedUp" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "GoalRecord_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "DailyRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GoalRecord_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Book Table (Reading room & page persistence)
CREATE TABLE IF NOT EXISTS "Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "currentPage" INTEGER NOT NULL DEFAULT 1,
    "totalPages" INTEGER DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create Promise Table (Promise Vault)
CREATE TABLE IF NOT EXISTS "Promise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "targetMinutes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "actualMinutes" INTEGER NOT NULL DEFAULT 0,
    "keptAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create Identity Stats Table (Streaks and kept commitments)
CREATE TABLE IF NOT EXISTS "IdentityStats" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalPromised" INTEGER NOT NULL DEFAULT 0,
    "totalKept" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- Create Note Table (Journal / Reflection notes)
CREATE TABLE IF NOT EXISTS "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Note_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create User Settings Table (Profile name & custom theme tokens)
CREATE TABLE IF NOT EXISTS "UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "name" TEXT NOT NULL DEFAULT 'Muheeb',
    "accentColor" TEXT NOT NULL DEFAULT '#2563eb',
    "backgroundColor" TEXT NOT NULL DEFAULT '#f4f6fa',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create User Table (Multi-user capability readiness)
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "name" TEXT NOT NULL DEFAULT 'Muheeb',
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Unique Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "DailyRecord_date_key" ON "DailyRecord"("date");
CREATE UNIQUE INDEX IF NOT EXISTS "GoalRecord_dailyRecordId_goalId_key" ON "GoalRecord"("dailyRecordId", "goalId");
