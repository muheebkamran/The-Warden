"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { assertDateAllowed } from "@/lib/dateEngine";
import { evaluateCommitment, CommitmentType } from "@/lib/evaluation";
import { evaluateAndUpdateStreak, getStreakState, resetStreak } from "@/lib/streak";
import { createSession, deleteSession, getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { hashPassword, verifyPassword, generateResetToken, isTokenExpired } from "@/lib/password";
import { sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email";

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
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/login?error=" + encodeURIComponent("Please enter both email and password."));
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Invalid email or password."));
  }

  if (!user.passwordHash) {
    redirect("/login?error=" + encodeURIComponent("This account was created with Google. Please click 'Continue with Google'."));
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    redirect("/login?error=" + encodeURIComponent("Invalid email or password."));
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const name = (formData.get("name") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/register?error=" + encodeURIComponent("Please provide email and password."));
  }

  if (password.length < 6) {
    redirect("/register?error=" + encodeURIComponent("Password must be at least 6 characters."));
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    redirect("/register?error=" + encodeURIComponent("An account with this email already exists. Please log in."));
  }

  const passwordHash = await hashPassword(password);

  const user = await db.user.create({
    data: {
      email,
      name,
      passwordHash,
      commitments: {
        create: [
          { title: "Read 20 mins", type: "duration", targetValue: 20, unit: "min", frequency: "daily" },
          { title: "Exercise", type: "binary", targetValue: 1, unit: "check", frequency: "daily" },
          { title: "Drink 2L Water", type: "binary", targetValue: 1, unit: "check", frequency: "daily" },
          { title: "No Junk Food", type: "binary", targetValue: 1, unit: "check", frequency: "daily" },
        ]
      }
    }
  });

  sendWelcomeEmail(email, name).catch(() => {});

  await createSession(user.id);
  redirect("/dashboard");
}

export async function forgotPassword(formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  if (!email) {
    redirect("/forgot-password?error=" + encodeURIComponent("Please enter your email."));
  }

  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    const { token, expiry } = generateResetToken();
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });
    await sendPasswordResetEmail(email, token);
  }

  redirect("/forgot-password?sent=true");
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  if (!token || !password) {
    redirect("/reset-password?error=" + encodeURIComponent("Missing reset token or password.") + (token ? `&token=${encodeURIComponent(token)}` : ""));
  }

  if (password.length < 6) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=` + encodeURIComponent("Password must be at least 6 characters."));
  }

  const user = await db.user.findFirst({
    where: { resetToken: token },
  });

  if (!user || isTokenExpired(user.resetTokenExpiry)) {
    redirect("/forgot-password?error=" + encodeURIComponent("This password reset link has expired or is invalid. Please request a new one."));
  }

  const passwordHash = await hashPassword(password);

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  await createSession(user.id);
  redirect("/dashboard?reset=success");
}

export async function handleGoogleUser(googleUser: {
  googleId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}) {
  const email = googleUser.email.toLowerCase().trim();

  let user = await db.user.findFirst({
    where: {
      OR: [
        { googleId: googleUser.googleId },
        { email },
      ],
    },
  });

  if (user) {
    if (!user.googleId || (!user.avatarUrl && googleUser.avatarUrl)) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleUser.googleId,
          avatarUrl: user.avatarUrl || googleUser.avatarUrl,
          name: user.name || googleUser.name,
        },
      });
    }
  } else {
    user = await db.user.create({
      data: {
        email,
        googleId: googleUser.googleId,
        name: googleUser.name,
        avatarUrl: googleUser.avatarUrl,
        commitments: {
          create: [
            { title: "Read 20 mins", type: "duration", targetValue: 20, unit: "min", frequency: "daily" },
            { title: "Exercise", type: "binary", targetValue: 1, unit: "check", frequency: "daily" },
            { title: "Drink 2L Water", type: "binary", targetValue: 1, unit: "check", frequency: "daily" },
            { title: "No Junk Food", type: "binary", targetValue: 1, unit: "check", frequency: "daily" },
          ],
        },
      },
    });

    sendWelcomeEmail(email, googleUser.name).catch(() => {});
  }

  return user;
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

// ─── Bill & OCR Server Actions ──────────────────────────────────────────────

// 35. addBill
export async function addBill(data: {
  billName: string;
  amount: number;
  date: string;
  photoUrl?: string;
  paid?: boolean;
}) {
  const { userId } = await requireAuth();
  const bill = await db.bill.create({
    data: {
      userId,
      billName: data.billName.trim(),
      amount: Math.abs(data.amount),
      date: data.date,
      photoUrl: data.photoUrl || null,
      paid: data.paid ?? false,
    },
  });
  revalidatePath("/finance");
  return bill;
}

// 36. toggleBillPaid
export async function toggleBillPaid(billId: string) {
  const { userId } = await requireAuth();
  const bill = await db.bill.findFirst({
    where: { id: billId, userId },
  });
  if (!bill) throw new Error("Bill not found");

  const updated = await db.bill.update({
    where: { id: billId },
    data: { paid: !bill.paid },
  });
  revalidatePath("/finance");
  return updated;
}

// 37. deleteBill
export async function deleteBill(billId: string) {
  const { userId } = await requireAuth();
  await db.bill.deleteMany({
    where: { id: billId, userId },
  });
  revalidatePath("/finance");
}

// 38. ocrBill
export async function ocrBill(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
) {
  await requireAuth();
  const { parseBillWithClaude } = await import("@/lib/billOcr");
  return await parseBillWithClaude(imageBase64, mediaType);
}
