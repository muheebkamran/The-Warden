import { test, describe, before, beforeEach } from "node:test";
import assert from "node:assert";

// 1. Mock next/headers and next/cache before loading modules
// eslint-disable-next-line @typescript-eslint/no-require-imports
const headers = require("next/headers");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cache = require("next/cache");

cache.revalidatePath = () => {};

// In-memory data store for tests
interface BillRecord {
  id: string;
  userId: string;
  billName: string;
  amount: number;
  date: string;
  photoUrl: string | null;
  paid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TransactionRecord {
  id: string;
  userId: string;
  amount: number;
  category: string;
  type: string;
  date: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ImpulseLockRecord {
  id: string;
  userId: string;
  itemName: string;
  amount: number;
  category: string;
  urgencyRationale: string | null;
  coolsAt: Date;
  status: string;
  createdAt: Date;
  resolvedAt: Date | null;
}

interface FinancialGoalRecord {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  targetDate: string | null;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const store = {
  bills: [] as BillRecord[],
  transactions: [] as TransactionRecord[],
  impulseLocks: [] as ImpulseLockRecord[],
  goals: [] as FinancialGoalRecord[],
};

let idCounter = 1;

// 2. Configure mock Prisma db on exported db instance
import { db } from "../lib/db";

const mockDb = {
  bill: {
    create: async ({ data }: { data: Partial<BillRecord> }) => {
      const item: BillRecord = {
        id: `bill_${idCounter++}`,
        userId: data.userId!,
        billName: data.billName!,
        amount: data.amount!,
        date: data.date!,
        photoUrl: data.photoUrl || null,
        paid: data.paid ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.bills.push(item);
      return item;
    },
    findFirst: async ({ where }: { where: { id: string; userId?: string } }) => {
      return (
        store.bills.find(
          (b) => b.id === where.id && (where.userId ? b.userId === where.userId : true)
        ) || null
      );
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<BillRecord>;
    }) => {
      const idx = store.bills.findIndex((b) => b.id === where.id);
      if (idx === -1) throw new Error("Record to update not found.");
      store.bills[idx] = { ...store.bills[idx], ...data, updatedAt: new Date() };
      return store.bills[idx];
    },
    deleteMany: async ({
      where,
    }: {
      where: { id: string; userId?: string };
    }) => {
      const initialLen = store.bills.length;
      store.bills = store.bills.filter(
        (b) => !(b.id === where.id && (where.userId ? b.userId === where.userId : true))
      );
      return { count: initialLen - store.bills.length };
    },
  },

  transaction: {
    create: async ({ data }: { data: Partial<TransactionRecord> }) => {
      const item: TransactionRecord = {
        id: `tx_${idCounter++}`,
        userId: data.userId!,
        amount: data.amount!,
        category: data.category!,
        type: data.type || "expense",
        date: data.date!,
        description: data.description!,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.transactions.push(item);
      return item;
    },
    findFirst: async ({ where }: { where: { id: string; userId?: string } }) => {
      return (
        store.transactions.find(
          (t) => t.id === where.id && (where.userId ? t.userId === where.userId : true)
        ) || null
      );
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<TransactionRecord>;
    }) => {
      const idx = store.transactions.findIndex((t) => t.id === where.id);
      if (idx === -1) throw new Error("Record to update not found.");
      store.transactions[idx] = {
        ...store.transactions[idx],
        ...data,
        updatedAt: new Date(),
      };
      return store.transactions[idx];
    },
    deleteMany: async ({
      where,
    }: {
      where: { id: string; userId?: string };
    }) => {
      const initialLen = store.transactions.length;
      store.transactions = store.transactions.filter(
        (t) => !(t.id === where.id && (where.userId ? t.userId === where.userId : true))
      );
      return { count: initialLen - store.transactions.length };
    },
  },

  impulseLock: {
    create: async ({ data }: { data: Partial<ImpulseLockRecord> }) => {
      const item: ImpulseLockRecord = {
        id: `lock_${idCounter++}`,
        userId: data.userId!,
        itemName: data.itemName!,
        amount: data.amount!,
        category: data.category || "impulse",
        urgencyRationale: data.urgencyRationale || null,
        coolsAt: data.coolsAt || new Date(),
        status: data.status || "cooling",
        createdAt: new Date(),
        resolvedAt: null,
      };
      store.impulseLocks.push(item);
      return item;
    },
    findFirst: async ({ where }: { where: { id: string; userId?: string } }) => {
      return (
        store.impulseLocks.find(
          (l) => l.id === where.id && (where.userId ? l.userId === where.userId : true)
        ) || null
      );
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<ImpulseLockRecord>;
    }) => {
      const idx = store.impulseLocks.findIndex((l) => l.id === where.id);
      if (idx === -1) throw new Error("Record to update not found.");
      store.impulseLocks[idx] = { ...store.impulseLocks[idx], ...data };
      return store.impulseLocks[idx];
    },
    deleteMany: async ({
      where,
    }: {
      where: { id: string; userId?: string };
    }) => {
      const initialLen = store.impulseLocks.length;
      store.impulseLocks = store.impulseLocks.filter(
        (l) => !(l.id === where.id && (where.userId ? l.userId === where.userId : true))
      );
      return { count: initialLen - store.impulseLocks.length };
    },
  },

  financialGoal: {
    create: async ({ data }: { data: Partial<FinancialGoalRecord> }) => {
      const item: FinancialGoalRecord = {
        id: `goal_${idCounter++}`,
        userId: data.userId!,
        title: data.title!,
        targetAmount: data.targetAmount!,
        currentAmount: data.currentAmount || 0,
        category: data.category || "fortress",
        targetDate: data.targetDate || null,
        isCompleted: data.isCompleted ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.goals.push(item);
      return item;
    },
    findFirst: async ({ where }: { where: { id: string; userId?: string } }) => {
      return (
        store.goals.find(
          (g) => g.id === where.id && (where.userId ? g.userId === where.userId : true)
        ) || null
      );
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<FinancialGoalRecord>;
    }) => {
      const idx = store.goals.findIndex((g) => g.id === where.id);
      if (idx === -1) throw new Error("Record to update not found.");
      store.goals[idx] = { ...store.goals[idx], ...data, updatedAt: new Date() };
      return store.goals[idx];
    },
    deleteMany: async ({
      where,
    }: {
      where: { id: string; userId?: string };
    }) => {
      const initialLen = store.goals.length;
      store.goals = store.goals.filter(
        (g) => !(g.id === where.id && (where.userId ? g.userId === where.userId : true))
      );
      return { count: initialLen - store.goals.length };
    },
  },
};

Object.assign(db, mockDb);

// Import actual production functions
import {
  addBill,
  updateBill,
  deleteBill,
  toggleBillPaid,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  createImpulseLock,
  resolveImpulseLock,
  createFinancialGoal,
  updateFinancialGoalProgress,
} from "../app/actions";
import { signToken } from "../lib/auth";

describe("Production Finance Server Actions & Core Logic", () => {
  const userA = "user_alpha_phase2";
  const userB = "user_beta_phase2";
  let tokenUserA: string;
  let tokenUserB: string;

  before(async () => {
    tokenUserA = await signToken({ userId: userA });
    tokenUserB = await signToken({ userId: userB });
  });

  function setSessionUser(token: string | null) {
    headers.cookies = () => ({
      get: (name: string) =>
        name === "session" && token ? { value: token } : undefined,
    });
  }

  beforeEach(() => {
    store.bills = [];
    store.transactions = [];
    store.impulseLocks = [];
    store.goals = [];
    setSessionUser(tokenUserA);
  });

  describe("Bills CRUD and Ownership", () => {
    test("should create a bill with authenticated userId", async () => {
      const bill = await addBill({
        billName: "Fiber Internet",
        amount: 79.99,
        date: "2026-10-15",
        photoUrl: "https://example.com/receipt.jpg",
      });

      assert.ok(bill.id);
      assert.strictEqual(bill.billName, "Fiber Internet");
      assert.strictEqual(bill.amount, 79.99);
      assert.strictEqual(bill.paid, false);
      assert.strictEqual(bill.userId, userA);
    });

    test("should update an existing bill preserving same ID", async () => {
      const created = await addBill({
        billName: "Cloud Server",
        amount: 45.0,
        date: "2026-10-10",
      });

      const updated = await updateBill({
        id: created.id,
        billName: "Cloud Server Pro",
        amount: 60.0,
        date: "2026-10-12",
        paid: true,
      });

      assert.strictEqual(updated.id, created.id);
      assert.strictEqual(updated.billName, "Cloud Server Pro");
      assert.strictEqual(updated.amount, 60.0);
      assert.strictEqual(updated.date, "2026-10-12");
      assert.strictEqual(updated.paid, true);
    });

    test("should toggle bill paid status", async () => {
      const bill = await addBill({
        billName: "Gym Membership",
        amount: 50.0,
        date: "2026-10-01",
      });
      assert.strictEqual(bill.paid, false);

      const toggled = await toggleBillPaid(bill.id);
      assert.strictEqual(toggled.paid, true);

      const untoggled = await toggleBillPaid(bill.id);
      assert.strictEqual(untoggled.paid, false);
    });

    test("should delete a bill owned by user", async () => {
      const bill = await addBill({
        billName: "Temporary Subscription",
        amount: 9.99,
        date: "2026-10-05",
      });

      assert.strictEqual(store.bills.length, 1);
      await deleteBill(bill.id);
      assert.strictEqual(store.bills.length, 0);
    });

    test("should reject updating nonexistent bill", async () => {
      await assert.rejects(
        async () => {
          await updateBill({
            id: "nonexistent_bill_id",
            billName: "Ghost",
            amount: 100,
            date: "2026-10-01",
          });
        },
        { message: "Bill not found or unauthorized" }
      );
    });

    test("should reject updating another user's bill (IDOR prevention)", async () => {
      // User A creates a bill
      const billA = await addBill({
        billName: "User A Bill",
        amount: 100,
        date: "2026-10-01",
      });

      // Switch session to User B
      setSessionUser(tokenUserB);

      await assert.rejects(
        async () => {
          await updateBill({
            id: billA.id,
            billName: "Hijacked by User B",
            amount: 1,
            date: "2026-10-01",
          });
        },
        { message: "Bill not found or unauthorized" }
      );

      // Verify bill remains intact
      assert.strictEqual(store.bills[0].billName, "User A Bill");
    });

    test("should reject deleting another user's bill (IDOR protection)", async () => {
      const billA = await addBill({
        billName: "Protected Bill A",
        amount: 250,
        date: "2026-10-01",
      });

      // Switch to User B
      setSessionUser(tokenUserB);
      await deleteBill(billA.id);

      // Bill A was NOT deleted because deleteBill filters by userId
      assert.strictEqual(store.bills.length, 1);
      assert.strictEqual(store.bills[0].id, billA.id);
    });

    test("should reject unauthenticated bill operations", async () => {
      setSessionUser(null);

      await assert.rejects(
        async () => {
          await addBill({ billName: "Fail", amount: 10, date: "2026-10-01" });
        },
        { message: "Unauthorized" }
      );

      await assert.rejects(
        async () => {
          await updateBill({ id: "any", billName: "Fail", amount: 10, date: "2026-10-01" });
        },
        { message: "Unauthorized" }
      );
    });

    test("should validate bill input fields server-side", async () => {
      const bill = await addBill({
        billName: "Valid Initial",
        amount: 50,
        date: "2026-10-01",
      });

      await assert.rejects(
        async () => {
          await updateBill({ id: bill.id, billName: "   ", amount: 50, date: "2026-10-01" });
        },
        { message: "Bill name is required" }
      );

      await assert.rejects(
        async () => {
          await updateBill({ id: bill.id, billName: "Test", amount: -20, date: "2026-10-01" });
        },
        { message: "Bill amount must be a positive number" }
      );

      await assert.rejects(
        async () => {
          await updateBill({ id: bill.id, billName: "Test", amount: 20, date: "invalid-date" });
        },
        { message: "Valid bill date (YYYY-MM-DD) is required" }
      );
    });
  });

  describe("Transactions CRUD and Ownership", () => {
    test("should create transaction with authenticated userId", async () => {
      await addTransaction({
        amount: 42.5,
        category: "food",
        type: "expense",
        date: "2026-10-07",
        description: "Grocery run",
      });

      assert.strictEqual(store.transactions.length, 1);
      const tx = store.transactions[0];
      assert.strictEqual(tx.userId, userA);
      assert.strictEqual(tx.amount, 42.5);
      assert.strictEqual(tx.category, "food");
      assert.strictEqual(tx.description, "Grocery run");
    });

    test("should update an existing transaction preserving ID and updating fields", async () => {
      await addTransaction({
        amount: 15.0,
        category: "transit",
        type: "expense",
        date: "2026-10-07",
        description: "Subway fare",
      });

      const original = store.transactions[0];

      const updated = await updateTransaction({
        id: original.id,
        amount: 18.5,
        category: "transit",
        type: "expense",
        date: "2026-10-08",
        description: "Subway fare + bus transfer",
      });

      assert.strictEqual(updated.id, original.id);
      assert.strictEqual(updated.amount, 18.5);
      assert.strictEqual(updated.date, "2026-10-08");
      assert.strictEqual(updated.description, "Subway fare + bus transfer");
    });

    test("should delete an owned transaction", async () => {
      await addTransaction({
        amount: 5.0,
        category: "other",
        date: "2026-10-07",
        description: "Coffee",
      });

      const tx = store.transactions[0];
      await deleteTransaction(tx.id);
      assert.strictEqual(store.transactions.length, 0);
    });

    test("should reject updating nonexistent transaction", async () => {
      await assert.rejects(
        async () => {
          await updateTransaction({
            id: "tx_does_not_exist",
            amount: 50,
            category: "food",
            date: "2026-10-07",
            description: "Phantom",
          });
        },
        { message: "Transaction not found or unauthorized" }
      );
    });

    test("should reject updating another user's transaction (IDOR protection)", async () => {
      await addTransaction({
        amount: 99.0,
        category: "shopping",
        date: "2026-10-07",
        description: "User A Headphones",
      });

      const txA = store.transactions[0];

      // Switch to User B
      setSessionUser(tokenUserB);

      await assert.rejects(
        async () => {
          await updateTransaction({
            id: txA.id,
            amount: 1.0,
            category: "shopping",
            date: "2026-10-07",
            description: "Tampered",
          });
        },
        { message: "Transaction not found or unauthorized" }
      );

      assert.strictEqual(store.transactions[0].amount, 99.0);
    });

    test("should reject deleting another user's transaction", async () => {
      await addTransaction({
        amount: 50.0,
        category: "food",
        date: "2026-10-07",
        description: "User A Dinner",
      });

      const txA = store.transactions[0];

      // Switch to User B
      setSessionUser(tokenUserB);
      await deleteTransaction(txA.id);

      // Verify transaction A still exists
      assert.strictEqual(store.transactions.length, 1);
    });

    test("should validate transaction input fields server-side", async () => {
      await addTransaction({
        amount: 20,
        category: "food",
        date: "2026-10-07",
        description: "Initial",
      });

      const tx = store.transactions[0];

      await assert.rejects(
        async () => {
          await updateTransaction({
            id: tx.id,
            amount: 0,
            category: "food",
            date: "2026-10-07",
            description: "Zero amount",
          });
        },
        { message: "Transaction amount must be a positive number" }
      );

      await assert.rejects(
        async () => {
          await updateTransaction({
            id: tx.id,
            amount: 10,
            category: "food",
            date: "bad-date",
            description: "Bad date",
          });
        },
        { message: "Valid date (YYYY-MM-DD) is required" }
      );

      await assert.rejects(
        async () => {
          await updateTransaction({
            id: tx.id,
            amount: 10,
            category: "food",
            date: "2026-10-07",
            description: "   ",
          });
        },
        { message: "Transaction description is required" }
      );
    });
  });

  describe("Impulse Lock Verdict Behavior", () => {
    test("should resolve impulse lock as purchased and automatically log an expense transaction", async () => {
      await createImpulseLock({
        itemName: "Mechanical Keyboard",
        amount: 149.0,
        category: "shopping",
        urgencyRationale: "Looks cool",
        hoursDelay: 48,
      });

      const lock = store.impulseLocks[0];
      assert.strictEqual(lock.status, "cooling");

      // Resolve with 'purchased'
      await resolveImpulseLock(lock.id, "purchased");

      assert.strictEqual(store.impulseLocks[0].status, "purchased");

      // Verify an expense transaction was automatically created!
      assert.strictEqual(store.transactions.length, 1);
      const autoTx = store.transactions[0];
      assert.strictEqual(autoTx.amount, 149.0);
      assert.strictEqual(autoTx.category, "shopping");
      assert.strictEqual(autoTx.type, "expense");
      assert.ok(autoTx.description.includes("Mechanical Keyboard"));
    });

    test("should resolve impulse lock as killed without creating a transaction", async () => {
      await createImpulseLock({
        itemName: "Impulse Gadget",
        amount: 80.0,
      });

      const lock = store.impulseLocks[0];

      await resolveImpulseLock(lock.id, "killed");

      assert.strictEqual(store.impulseLocks[0].status, "killed");
      // Capital preserved! No transaction logged
      assert.strictEqual(store.transactions.length, 0);
    });
  });

  describe("Financial Goals Progress", () => {
    test("should increment currentAmount and mark completed when target is met", async () => {
      await createFinancialGoal({
        title: "Emergency Fund",
        targetAmount: 1000,
        currentAmount: 800,
      });

      const goal = store.goals[0];
      assert.strictEqual(goal.isCompleted, false);

      // Deposit 250 with isDelta = true
      await updateFinancialGoalProgress(goal.id, 250, true);

      assert.strictEqual(store.goals[0].currentAmount, 1050);
      assert.strictEqual(store.goals[0].isCompleted, true);
    });
  });

  describe("Core Finance Domain Calculations", () => {
    test("daily allowance calculation", () => {
      const budget = 3000;
      const dailyAllowance = budget > 0 ? budget / 30 : 0;
      assert.strictEqual(dailyAllowance, 100);

      const zeroBudget = 0;
      const zeroAllowance = zeroBudget > 0 ? zeroBudget / 30 : 0;
      assert.strictEqual(zeroAllowance, 0);
    });

    test("monthly burn velocity percentage", () => {
      const monthlyBudget = 2000;
      const monthSpent = 1500;
      const percent = Math.min(100, Math.round((monthSpent / monthlyBudget) * 100));
      assert.strictEqual(percent, 75);

      const exceededSpent = 2500;
      const exceededPercent = monthlyBudget > 0 ? Math.round((exceededSpent / monthlyBudget) * 100) : 0;
      assert.strictEqual(exceededPercent, 125);
    });

    test("savings rate calculation", () => {
      const totalIncome = 5000;
      const totalOutflows = 3500;
      const netSavings = totalIncome - totalOutflows;
      const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;
      assert.strictEqual(netSavings, 1500);
      assert.strictEqual(savingsRate, 30);

      // Deficit case
      const deficitIncome = 2000;
      const deficitOutflows = 3000;
      const deficitNet = deficitIncome - deficitOutflows;
      const deficitRate = deficitIncome > 0 ? Math.max(0, Math.round((deficitNet / deficitIncome) * 100)) : 0;
      assert.strictEqual(deficitNet, -1000);
      assert.strictEqual(deficitRate, 0);
    });
  });
});
