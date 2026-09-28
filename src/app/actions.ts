"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { assertEntryDateAllowed } from "@/lib/dateRules";

// ─── Goal / Habit Actions ────────────────────────────────────────────────────


export async function createGoal(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const targetMinutes = Number(formData.get("targetMinutes"));
  if (!name || !Number.isFinite(targetMinutes) || targetMinutes <= 0) return;
  await db.goal.create({ data: { name, targetMinutes } });
  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  revalidatePath("/matrix");
}

export async function updateGoal(formData: FormData) {
  const goalId = String(formData.get("goalId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const targetMinutes = Number(formData.get("targetMinutes"));
  if (!goalId || !name || !Number.isFinite(targetMinutes) || targetMinutes <= 0) return;

  await db.goal.update({
    where: { id: goalId },
    data: { name, targetMinutes },
  });

  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  revalidatePath("/matrix");
}

export async function deleteGoal(goalId: string) {
  if (!goalId) return;
  await db.goal.delete({ where: { id: goalId } });
  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  revalidatePath("/matrix");
}

export async function saveDailyRecord(formData: FormData) {
  const date = String(formData.get("date") ?? "").trim();
  if (!date) return;
  assertEntryDateAllowed(date, "Daily debrief");

  const sleepTime = String(formData.get("sleepTime") ?? "").trim() || null;
  const wakeTime = String(formData.get("wakeTime") ?? "").trim() || null;
  const reflection = String(formData.get("reflection") ?? "").trim() || null;

  const phoneHours = Math.max(0, Number(formData.get("phoneHours")) || 0);
  const phoneMins = Math.max(0, Number(formData.get("phoneMins")) || 0);
  const phoneMinutes = phoneHours * 60 + phoneMins;

  const goals = await db.goal.findMany({ where: { active: true } });

  const dailyRecord = await db.dailyRecord.upsert({
    where: { date },
    create: { date, sleepTime, wakeTime, phoneMinutes, reflection },
    update: { sleepTime, wakeTime, phoneMinutes, reflection },
  });

  for (const goal of goals) {
    const actualMinutes = Math.max(0, Number(formData.get(`actual_${goal.id}`)) || 0);
    const showedUp = formData.get(`showedUp_${goal.id}`) === "on";
    await db.goalRecord.upsert({
      where: { dailyRecordId_goalId: { dailyRecordId: dailyRecord.id, goalId: goal.id } },
      create: { dailyRecordId: dailyRecord.id, goalId: goal.id, targetMinutes: goal.targetMinutes, actualMinutes, showedUp },
      update: { actualMinutes, showedUp, targetMinutes: goal.targetMinutes },
    });
  }
  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  revalidatePath("/matrix");
}

export async function logHabitCell(formData: FormData) {
  const goalId = String(formData.get("goalId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const hours = Math.max(0, Number(formData.get("hours")) || 0);
  const minutes = Math.max(0, Number(formData.get("minutes")) || 0);
  const showedUp = formData.get("showedUp") === "true";
  const actualMinutes = hours * 60 + minutes;

  if (!goalId || !date) return;
  assertEntryDateAllowed(date, "Habit cell log");

  const goal = await db.goal.findUnique({ where: { id: goalId } });
  if (!goal) return;

  const dailyRecord = await db.dailyRecord.upsert({
    where: { date },
    create: { date },
    update: {},
  });

  await db.goalRecord.upsert({
    where: { dailyRecordId_goalId: { dailyRecordId: dailyRecord.id, goalId: goal.id } },
    create: { dailyRecordId: dailyRecord.id, goalId: goal.id, targetMinutes: goal.targetMinutes, actualMinutes, showedUp: showedUp || actualMinutes > 0 },
    update: { actualMinutes, showedUp: showedUp || actualMinutes > 0 },
  });

  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  revalidatePath("/matrix");
}

export async function clearHabitCell(goalId: string, date: string) {
  if (!goalId || !date) return;
  assertEntryDateAllowed(date, "Clear habit cell");

  const dailyRecord = await db.dailyRecord.findUnique({ where: { date } });
  if (!dailyRecord) return;
  await db.goalRecord.deleteMany({ where: { dailyRecordId: dailyRecord.id, goalId } });
  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  revalidatePath("/matrix");
}

export async function toggleHabitDay(goalId: string, date: string) {
  if (!goalId || !date) return;
  assertEntryDateAllowed(date, "Toggle habit day");

  const goal = await db.goal.findUnique({ where: { id: goalId } });
  if (!goal) return;

  const dailyRecord = await db.dailyRecord.upsert({
    where: { date },
    create: { date },
    update: {},
  });

  const existing = await db.goalRecord.findUnique({
    where: { dailyRecordId_goalId: { dailyRecordId: dailyRecord.id, goalId } },
  });

  if (existing && (existing.showedUp || existing.actualMinutes > 0)) {
    await db.goalRecord.update({
      where: { id: existing.id },
      data: { showedUp: false, actualMinutes: 0 },
    });
  } else if (existing) {
    await db.goalRecord.update({
      where: { id: existing.id },
      data: { showedUp: true, actualMinutes: goal.targetMinutes },
    });
  } else {
    await db.goalRecord.create({
      data: {
        dailyRecordId: dailyRecord.id,
        goalId: goal.id,
        targetMinutes: goal.targetMinutes,
        actualMinutes: goal.targetMinutes,
        showedUp: true,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  revalidatePath("/matrix");
}


// ─── Notes Actions ────────────────────────────────────────────────────────────

export async function addNote(formData: FormData) {
  const content = String(formData.get("content") ?? "").trim();
  const goalId = String(formData.get("goalId") ?? "").trim() || null;
  if (!content) return;
  await db.note.create({
    data: { content, goalId },
  });
  revalidatePath("/");
}

export async function deleteNote(noteId: string) {
  if (!noteId) return;
  await db.note.delete({ where: { id: noteId } });
  revalidatePath("/");
}


// ─── Promise / Commitment Actions ────────────────────────────────────────────

export async function createPromise(formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const targetMinutesRaw = Number(formData.get("targetMinutes"));
  const targetMinutes = Number.isFinite(targetMinutesRaw) && targetMinutesRaw > 0 ? targetMinutesRaw : null;

  if (!text || !date) return;
  assertEntryDateAllowed(date, "Create promise");

  await db.promise.create({
    data: { text, date, targetMinutes, status: "pending" },
  });

  await db.identityStats.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", totalPromised: 1, totalKept: 0, longestStreak: 0 },
    update: { totalPromised: { increment: 1 } },
  });

  revalidatePath("/");
  revalidatePath("/vault");
}

export async function keepPromise(formData: FormData) {
  const promiseId = String(formData.get("promiseId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const actualMinutes = Math.max(0, Number(formData.get("actualMinutes")) || 0);

  if (!promiseId) return;
  const existing = await db.promise.findUnique({ where: { id: promiseId } });
  if (!existing) return;
  assertEntryDateAllowed(existing.date, "Fulfill promise");

  const status = "kept";

  await db.promise.update({
    where: { id: promiseId },
    data: { status, actualMinutes, notes, keptAt: new Date() },
  });

  await db.identityStats.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", totalPromised: 1, totalKept: 1, longestStreak: 1 },
    update: { totalKept: { increment: 1 } },
  });

  revalidatePath("/");
  revalidatePath("/vault");
}

export async function missPromise(promiseId: string) {
  if (!promiseId) return;
  const existing = await db.promise.findUnique({ where: { id: promiseId } });
  if (!existing) return;
  assertEntryDateAllowed(existing.date, "Mark promise missed");

  await db.promise.update({ where: { id: promiseId }, data: { status: "missed" } });
  revalidatePath("/");
  revalidatePath("/vault");
}

export async function deletePromise(promiseId: string) {
  if (!promiseId) return;
  const existing = await db.promise.findUnique({ where: { id: promiseId } });
  if (!existing) return;
  assertEntryDateAllowed(existing.date, "Delete promise");

  await db.promise.delete({ where: { id: promiseId } });
  revalidatePath("/");
  revalidatePath("/vault");
}


// ─── Book Actions ─────────────────────────────────────────────────────────────

export async function uploadBook(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return;

  const title = (formData.get("title") as string)?.trim() || file.name.replace(/\.[^/.]+$/, "");
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const booksDir = path.join(process.cwd(), "public", "books");
  await fs.mkdir(booksDir, { recursive: true });
  const filePath = path.join(booksDir, sanitizedFileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  const fileUrl = `/books/${encodeURIComponent(sanitizedFileName)}`;

  const existing = await db.book.findFirst({ where: { fileName: sanitizedFileName } });
  if (existing) {
    await db.book.update({ where: { id: existing.id }, data: { title, fileUrl, updatedAt: new Date() } });
  } else {
    await db.book.create({ data: { title, fileName: sanitizedFileName, fileUrl, currentPage: 1 } });
  }
  revalidatePath("/reader");
}

export async function updateBookProgress(bookId: string, page: number) {
  if (!bookId || page < 1) return;
  await db.book.update({
    where: { id: bookId },
    data: { currentPage: Math.max(1, Math.round(page)), updatedAt: new Date() },
  });
}

export async function deleteBook(bookId: string) {
  if (!bookId) return;
  const book = await db.book.findUnique({ where: { id: bookId } });
  if (book) {
    try {
      const filePath = path.join(process.cwd(), "public", "books", book.fileName);
      await fs.unlink(filePath);
    } catch {}
    await db.book.delete({ where: { id: bookId } });
  }
  revalidatePath("/reader");
}

// ─── User Settings & Preferences Actions ─────────────────────────────────────

export async function getUserSettings() {
  let settings = await db.userSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) {
    settings = await db.userSettings.create({
      data: {
        id: "singleton",
        name: "Muheeb",
        accentColor: "#2563eb",
        backgroundColor: "#f4f6fa",
      },
    });
  }
  return settings;
}

export async function updateUserSettings(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim() || "Muheeb";
  const accentColor = String(formData.get("accentColor") ?? "").trim() || "#2563eb";
  const backgroundColor = String(formData.get("backgroundColor") ?? "").trim() || "#f4f6fa";

  await db.userSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", name, accentColor, backgroundColor },
    update: { name, accentColor, backgroundColor },
  });

  revalidatePath("/");
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/matrix");
}