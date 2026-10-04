"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { assertDateAllowed } from "@/lib/dateEngine";
import { evaluateCommitment, CommitmentType } from "@/lib/evaluation";
import { evaluateAndUpdateStreak, getStreakState, resetStreak } from "@/lib/streak";
import { createSession, deleteSession, getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

// 1. requireAuth
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

// Auth Actions
export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) throw new Error("Missing email or password");

  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error("Invalid credentials");

  await createSession(user.id);
  redirect("/");
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("Missing required fields");
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      commitments: {
        create: [
          { title: "Read", type: "duration", targetValue: 30, unit: "min", frequency: "daily" },
          { title: "Watch a lecture", type: "binary", targetValue: 1, unit: "check", frequency: "daily" },
          { title: "Be in the office", type: "binary", targetValue: 1, unit: "check", frequency: "daily" },
          { title: "Physical activity", type: "binary", targetValue: 1, unit: "check", frequency: "daily" },
        ]
      }
    }
  });

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

// 2. getCommitments
export async function getCommitments() {
  const { userId } = await requireAuth();
  return db.commitment.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}

// 3. getActiveCommitments
export async function getActiveCommitments() {
  const { userId } = await requireAuth();
  return db.commitment.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'asc' },
  });
}

// 4. createCommitment
export async function createCommitment(formData: FormData) {
  const { userId } = await requireAuth();
  const title = formData.get("title") as string;
  const type = formData.get("type") as CommitmentType;
  let targetValue = Number(formData.get("targetValue"));
  let unit = formData.get("unit") as string;

  if (!title) throw new Error("Title is required");
  if (!['duration', 'quantity', 'count', 'binary'].includes(type)) throw new Error("Invalid type");

  if (type === 'binary') {
    targetValue = 1;
    unit = 'check';
  } else {
    if (targetValue <= 0) throw new Error("Target value must be greater than 0");
  }

  await db.commitment.create({
    data: {
      userId,
      title,
      type,
      targetValue,
      unit,
      frequency: 'daily',
      isActive: true,
    }
  });

  revalidatePath('/');
  revalidatePath('/habits');
}

// 5. updateCommitment
export async function updateCommitment(formData: FormData) {
  const { userId } = await requireAuth();
  const commitmentId = formData.get("commitmentId") as string;
  const title = formData.get("title") as string;
  const targetValue = Number(formData.get("targetValue"));
  const unit = formData.get("unit") as string;

  if (!title || title.trim() === "") throw new Error("Title is required");

  const commitment = await db.commitment.findFirst({ where: { id: commitmentId, userId } });
  if (!commitment) throw new Error("Not found");

  await db.commitment.update({
    where: { id: commitmentId },
    data: { title, targetValue, unit },
  });

  revalidatePath('/');
  revalidatePath('/habits');
}

// 6. toggleCommitmentActive
export async function toggleCommitmentActive(commitmentId: string) {
  const { userId } = await requireAuth();
  const commitment = await db.commitment.findFirst({ where: { id: commitmentId, userId } });
  if (!commitment) return;

  await db.commitment.update({
    where: { id: commitmentId },
    data: { isActive: !commitment.isActive },
  });

  revalidatePath('/');
  revalidatePath('/habits');
}

// 7. deleteCommitment
export async function deleteCommitment(commitmentId: string) {
  const { userId } = await requireAuth();
  const commitment = await db.commitment.findFirst({ where: { id: commitmentId, userId } });
  if (!commitment) return;

  await db.commitment.delete({ where: { id: commitmentId } });
  revalidatePath('/');
  revalidatePath('/habits');
  revalidatePath('/progress');
}

// 8. recordCommitment
export async function recordCommitment(formData: FormData) {
  const { userId } = await requireAuth();
  const commitmentId = formData.get("commitmentId") as string;
  const date = formData.get("date") as string;
  const actualValue = Number(formData.get("actualValue"));
  const note = formData.get("note") as string | null;

  assertDateAllowed(date, 'Record commitment');

  const commitment = await db.commitment.findFirst({ where: { id: commitmentId, userId } });
  if (!commitment) throw new Error("Commitment not found");

  const status = evaluateCommitment(commitment.type as CommitmentType, commitment.targetValue, actualValue);

  await db.dailyRecord.upsert({
    where: {
      commitmentId_date: { commitmentId, date },
    },
    update: {
      actualValue,
      status,
      note,
      targetValue: commitment.targetValue,
    },
    create: {
      userId,
      commitmentId,
      date,
      targetValue: commitment.targetValue,
      actualValue,
      status,
      note,
    },
  });

  await evaluateAndUpdateStreak(userId, date);
  revalidatePath('/');
  revalidatePath('/progress');
}

// 9. quickComplete
export async function quickComplete(commitmentId: string, date: string) {
  const { userId } = await requireAuth();
  assertDateAllowed(date, 'Quick complete');

  const commitment = await db.commitment.findFirst({ where: { id: commitmentId, userId } });
  if (!commitment) throw new Error("Commitment not found");

  const actualValue = commitment.targetValue;
  const status = evaluateCommitment(commitment.type as CommitmentType, commitment.targetValue, actualValue);

  await db.dailyRecord.upsert({
    where: {
      commitmentId_date: { commitmentId, date },
    },
    update: {
      actualValue,
      status,
      targetValue: commitment.targetValue,
    },
    create: {
      userId,
      commitmentId,
      date,
      targetValue: commitment.targetValue,
      actualValue,
      status,
    },
  });

  await evaluateAndUpdateStreak(userId, date);
  revalidatePath('/');
  revalidatePath('/progress');
}

// 10. clearRecord
export async function clearRecord(commitmentId: string, date: string) {
  const { userId } = await requireAuth();
  assertDateAllowed(date, 'Clear record');

  const commitment = await db.commitment.findFirst({ where: { id: commitmentId, userId } });
  if (!commitment) throw new Error("Commitment not found");

  await db.dailyRecord.delete({
    where: {
      commitmentId_date: { commitmentId, date },
    },
  }).catch(() => { /* ignore if not found */ });

  await evaluateAndUpdateStreak(userId, date);
  revalidatePath('/');
  revalidatePath('/progress');
}

// 11. getDailyRecords
export async function getDailyRecords(date: string) {
  const { userId } = await requireAuth();
  return db.dailyRecord.findMany({
    where: { userId, date },
  });
}

// 12. getStreakData
export async function getStreakData() {
  const { userId } = await requireAuth();
  return getStreakState(userId);
}

// 13. resetStreakAction
export async function resetStreakAction() {
  const { userId } = await requireAuth();
  await resetStreak(userId);
  revalidatePath('/');
  revalidatePath('/progress');
}

// 14. updateUserSettings
export async function updateUserSettings(formData: FormData) {
  const { userId } = await requireAuth();
  const email = formData.get("email") as string;
  const timezone = formData.get("timezone") as string;

  await db.user.update({
    where: { id: userId },
    data: { email, timezone },
  });

  revalidatePath('/settings');
}

// 15. exportUserData
export async function exportUserData() {
  const { userId } = await requireAuth();
  const commitments = await db.commitment.findMany({ where: { userId } });
  const records = await db.dailyRecord.findMany({ where: { userId } });

  return JSON.stringify({ commitments, records }, null, 2);
}

// 16. deleteMyData
export async function deleteMyData() {
  const { userId } = await requireAuth();
  
  await db.dailyRecord.deleteMany({ where: { userId } });
  await db.commitment.deleteMany({ where: { userId } });
  await db.streakState.delete({ where: { userId } }).catch(() => {});
  await db.dailyReflection.deleteMany({ where: { userId } });

  revalidatePath('/');
}

// 17. saveReflection
export async function saveReflection(date: string, text: string) {
  const { userId } = await requireAuth();
  assertDateAllowed(date, 'Save reflection');

  await db.dailyReflection.upsert({
    where: { userId_date: { userId, date } },
    update: { text },
    create: { userId, date, text },
  });

  revalidatePath('/');
}

// 18. getReflection
export async function getReflection(date: string) {
  const { userId } = await requireAuth();
  return db.dailyReflection.findUnique({
    where: { userId_date: { userId, date } },
  });
}

// 19. saveUserTheme
export async function saveUserTheme(themeId: string) {
  const { userId } = await requireAuth();
  await db.user.update({
    where: { id: userId },
    data: { preferredTheme: themeId },
  });
  revalidatePath('/settings');
}

// 20. updateUserAvatar
export async function updateUserAvatar(avatarUrl: string) {
  const { userId } = await requireAuth();
  await db.user.update({
    where: { id: userId },
    data: { avatarUrl },
  });
  revalidatePath('/settings');
}

// 21. attachProofPhoto
export async function attachProofPhoto(commitmentId: string, date: string, photoUrl: string) {
  const { userId } = await requireAuth();
  assertDateAllowed(date, 'Attach proof photo');

  const commitment = await db.commitment.findFirst({
    where: { id: commitmentId, userId },
  });
  if (!commitment) throw new Error('Commitment not found');

  await db.dailyRecord.upsert({
    where: {
      commitmentId_date: { commitmentId, date },
    },
    update: {
      photoUrl,
    },
    create: {
      userId,
      commitmentId,
      date,
      targetValue: commitment.targetValue,
      actualValue: 0,
      status: 'missed',
      photoUrl,
    },
  });

  revalidatePath('/');
  revalidatePath('/progress');
}

// 22. addBook
export async function addBook(
  title: string,
  author: string | null,
  fileUrl: string,
  totalPages: number = 1
) {
  const { userId } = await requireAuth();
  if (!title || !fileUrl) throw new Error('Title and fileUrl are required');

  const book = await db.book.create({
    data: {
      userId,
      title,
      author,
      fileUrl,
      totalPages: Math.max(1, totalPages),
      currentPage: 1,
    },
  });

  revalidatePath('/reader');
  return book;
}

// 23. updateBookProgress
export async function updateBookProgress(
  bookId: string,
  currentPage: number,
  totalPages?: number
) {
  const { userId } = await requireAuth();
  const book = await db.book.findFirst({
    where: { id: bookId, userId },
  });
  if (!book) throw new Error('Book not found');

  const updatedTotal = totalPages ? Math.max(book.totalPages, totalPages) : book.totalPages;
  const isCompleted = currentPage >= updatedTotal;

  await db.book.update({
    where: { id: bookId },
    data: {
      currentPage,
      totalPages: updatedTotal,
      isCompleted,
    },
  });

  revalidatePath('/reader');
}

// 24. recordReadingSession
export async function recordReadingSession(
  bookId: string,
  minutesRead: number,
  currentPage: number,
  totalPages: number
) {
  const { userId } = await requireAuth();

  const book = await db.book.findFirst({
    where: { id: bookId, userId },
  });
  if (!book) throw new Error('Book not found');

  const today = new Date().toISOString().split('T')[0];
  const pagesRead = Math.max(0, currentPage - book.currentPage);

  // 1. Upsert today's reading session
  await db.readingSession.upsert({
    where: {
      bookId_date: {
        bookId,
        date: today,
      },
    },
    create: {
      bookId,
      userId,
      date: today,
      minutesRead,
      pagesRead,
    },
    update: {
      minutesRead: { increment: minutesRead },
      pagesRead: { increment: pagesRead },
    },
  });

  // 2. Update current page & progress
  const updatedTotal = Math.max(book.totalPages, totalPages);
  await db.book.update({
    where: { id: bookId },
    data: {
      currentPage,
      totalPages: updatedTotal,
      isCompleted: currentPage >= updatedTotal,
    },
  });

  // 3. Auto-complete or advance daily 'Read' commitment if one exists!
  const readCommitment = await db.commitment.findFirst({
    where: {
      userId,
      isActive: true,
      title: { contains: 'Read', mode: 'insensitive' },
    },
  });

  if (readCommitment) {
    const existingDaily = await db.dailyRecord.findUnique({
      where: {
        commitmentId_date: {
          commitmentId: readCommitment.id,
          date: today,
        },
      },
    });

    const currentActual = existingDaily?.actualValue || 0;
    const newActual = currentActual + minutesRead;
    const status = newActual >= readCommitment.targetValue ? 'complete' : (newActual >= 0.3 * readCommitment.targetValue ? 'showed_up' : 'missed');

    await db.dailyRecord.upsert({
      where: {
        commitmentId_date: {
          commitmentId: readCommitment.id,
          date: today,
        },
      },
      create: {
        userId,
        commitmentId: readCommitment.id,
        date: today,
        targetValue: readCommitment.targetValue,
        actualValue: newActual,
        status,
        note: `Read ${book.title}`,
      },
      update: {
        actualValue: newActual,
        status,
        note: `Read ${book.title}`,
      },
    });
  }

  revalidatePath('/reader');
  revalidatePath('/');
  revalidatePath('/progress');
}

// 25. deleteBook
export async function deleteBook(bookId: string) {
  const { userId } = await requireAuth();
  await db.book.deleteMany({
    where: { id: bookId, userId },
  });
  revalidatePath('/reader');
}

// ─── Financial Discipline Chamber Server Actions ─────────────────────────────

// 26. updateFinanceBudget
export async function updateFinanceBudget(monthlyBudget: number, currency: string = "$") {
  const { userId } = await requireAuth();
  await db.financeProfile.upsert({
    where: { userId },
    create: {
      userId,
      monthlyBudget: Math.max(0, monthlyBudget),
      currency: currency || "$",
    },
    update: {
      monthlyBudget: Math.max(0, monthlyBudget),
      currency: currency || "$",
    },
  });
  revalidatePath("/finance");
}

// 27. addTransaction
export async function addTransaction(data: {
  amount: number;
  category: string;
  type?: "expense" | "income";
  date: string;
  description: string;
}) {
  const { userId } = await requireAuth();
  await db.transaction.create({
    data: {
      userId,
      amount: Math.abs(data.amount),
      category: data.category || "other",
      type: data.type || "expense",
      date: data.date,
      description: data.description.trim(),
    },
  });
  revalidatePath("/finance");
}

// 28. deleteTransaction
export async function deleteTransaction(transactionId: string) {
  const { userId } = await requireAuth();
  await db.transaction.deleteMany({
    where: { id: transactionId, userId },
  });
  revalidatePath("/finance");
}

// 29. createImpulseLock
export async function createImpulseLock(data: {
  itemName: string;
  amount: number;
  category?: string;
  urgencyRationale?: string;
  hoursDelay?: number;
}) {
  const { userId } = await requireAuth();
  const delay = data.hoursDelay && data.hoursDelay > 0 ? data.hoursDelay : 48;
  const coolsAt = new Date(Date.now() + delay * 60 * 60 * 1000);

  await db.impulseLock.create({
    data: {
      userId,
      itemName: data.itemName.trim(),
      amount: Math.abs(data.amount),
      category: data.category || "impulse",
      urgencyRationale: data.urgencyRationale?.trim() || null,
      coolsAt,
      status: "cooling",
    },
  });
  revalidatePath("/finance");
}

// 30. resolveImpulseLock
export async function resolveImpulseLock(lockId: string, resolution: "killed" | "purchased") {
  const { userId } = await requireAuth();
  const lock = await db.impulseLock.findFirst({
    where: { id: lockId, userId },
  });

  if (!lock) throw new Error("Lock not found");

  await db.impulseLock.update({
    where: { id: lockId },
    data: {
      status: resolution,
      resolvedAt: new Date(),
    },
  });

  // If user decides to purchase after the cooling period, automatically log the expense!
  if (resolution === "purchased") {
    const today = new Date().toISOString().split("T")[0];
    await db.transaction.create({
      data: {
        userId,
        amount: lock.amount,
        category: lock.category || "shopping",
        type: "expense",
        date: today,
        description: `${lock.itemName} (Approved post-cooling)`,
      },
    });
  }

  revalidatePath("/finance");
}

// 31. deleteImpulseLock
export async function deleteImpulseLock(lockId: string) {
  const { userId } = await requireAuth();
  await db.impulseLock.deleteMany({
    where: { id: lockId, userId },
  });
  revalidatePath("/finance");
}

// 32. createFinancialGoal
export async function createFinancialGoal(data: {
  title: string;
  targetAmount: number;
  currentAmount?: number;
  category?: string;
  targetDate?: string;
}) {
  const { userId } = await requireAuth();
  const current = Math.max(0, data.currentAmount || 0);
  const target = Math.max(1, data.targetAmount);

  await db.financialGoal.create({
    data: {
      userId,
      title: data.title.trim(),
      targetAmount: target,
      currentAmount: current,
      category: data.category || "fortress",
      targetDate: data.targetDate || null,
      isCompleted: current >= target,
    },
  });
  revalidatePath("/finance");
}

// 33. updateFinancialGoalProgress
export async function updateFinancialGoalProgress(goalId: string, addedOrNewAmount: number, isDelta: boolean = false) {
  const { userId } = await requireAuth();
  const goal = await db.financialGoal.findFirst({
    where: { id: goalId, userId },
  });

  if (!goal) throw new Error("Goal not found");

  const newAmount = Math.max(0, isDelta ? goal.currentAmount + addedOrNewAmount : addedOrNewAmount);
  await db.financialGoal.update({
    where: { id: goalId },
    data: {
      currentAmount: newAmount,
      isCompleted: newAmount >= goal.targetAmount,
    },
  });
  revalidatePath("/finance");
}

// 34. deleteFinancialGoal
export async function deleteFinancialGoal(goalId: string) {
  const { userId } = await requireAuth();
  await db.financialGoal.deleteMany({
    where: { id: goalId, userId },
  });
  revalidatePath("/finance");
}