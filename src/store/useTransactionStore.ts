import { create } from 'zustand';
import { db } from '../db/client';
import { transactions, Transaction, NewTransaction, accounts } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { useGoalStore } from './useGoalStore';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  loadTransactions: (userId?: number) => Promise<void>;
  addTransaction: (transaction: NewTransaction) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  updateTransaction: (id: number, data: Partial<NewTransaction>) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  loadTransactions: async (userId?: number) => {
    if (!userId) {
      set({ transactions: [] });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const allTransactions = await db.select().from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.date));
      set({ transactions: allTransactions, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load transactions', isLoading: false });
      console.error(error);
    }
  },

  addTransaction: async (newTransaction) => {
    set({ isLoading: true, error: null });
    try {
      await db.transaction(async (tx) => {
        // 1. Insert Transaction
        await tx.insert(transactions).values(newTransaction);

        // 2. Update Account Balance
        const account = await tx.select().from(accounts).where(eq(accounts.id, newTransaction.accountId)).get();
        if (account) {
          const newBalance = newTransaction.type === 'income' 
            ? account.balance + newTransaction.amount 
            : account.balance - newTransaction.amount;
          
          await tx.update(accounts)
            .set({ balance: newBalance })
            .where(eq(accounts.id, newTransaction.accountId));
        }

        // 3. If "Goal Fund" expense, add to Goals Wallet
        if (newTransaction.type === 'expense' && newTransaction.category === 'Goal Fund') {
          const { addToWallet } = useGoalStore.getState();
          await addToWallet(newTransaction.amount, newTransaction.userId);
        }
      });

      // Reload transactions for the user
      const allTransactions = await db.select().from(transactions)
        .where(eq(transactions.userId, newTransaction.userId))
        .orderBy(desc(transactions.date));
      set({ transactions: allTransactions, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add transaction', isLoading: false });
      console.error(error);
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      let userId: number | undefined;
      await db.transaction(async (tx) => {
        // 1. Get transaction details before deleting
        const transaction = await tx.select().from(transactions).where(eq(transactions.id, id)).get();
        if (!transaction) return;
        userId = transaction.userId;

        // 2. Revert Account Balance
        const account = await tx.select().from(accounts).where(eq(accounts.id, transaction.accountId)).get();
        if (account) {
          const newBalance = transaction.type === 'income'
            ? account.balance - transaction.amount
            : account.balance + transaction.amount;

          await tx.update(accounts)
            .set({ balance: newBalance })
            .where(eq(accounts.id, transaction.accountId));
        }

        // 3. Delete Transaction
        await tx.delete(transactions).where(eq(transactions.id, id));
      });

      if (userId) {
        const allTransactions = await db.select().from(transactions)
          .where(eq(transactions.userId, userId))
          .orderBy(desc(transactions.date));
        set({ transactions: allTransactions, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to delete transaction', isLoading: false });
      console.error(error);
    }
  },

  updateTransaction: async (id: number, data: Partial<NewTransaction>) => {
    set({ isLoading: true, error: null });
    try {
      let userId: number | undefined;
      await db.transaction(async (tx) => {
        // 1. Get old transaction
        const oldTransaction = await tx.select().from(transactions).where(eq(transactions.id, id)).get();
        if (!oldTransaction) return;
        userId = oldTransaction.userId;

        // 2. Revert old balance effect
        const account = await tx.select().from(accounts).where(eq(accounts.id, oldTransaction.accountId)).get();
        if (account) {
          let balance = account.balance;
          
          // Revert old
          balance = oldTransaction.type === 'income' 
            ? balance - oldTransaction.amount 
            : balance + oldTransaction.amount;

          // Apply new (if changed, otherwise use old values)
          const newAmount = data.amount !== undefined ? data.amount : oldTransaction.amount;
          const newType = data.type !== undefined ? data.type : oldTransaction.type;

          balance = newType === 'income'
            ? balance + newAmount
            : balance - newAmount;

          await tx.update(accounts)
            .set({ balance })
            .where(eq(accounts.id, oldTransaction.accountId));
        }

        // 3. Update Transaction
        await tx.update(transactions).set(data).where(eq(transactions.id, id));
      });

      if (userId) {
        const allTransactions = await db.select().from(transactions)
          .where(eq(transactions.userId, userId))
          .orderBy(desc(transactions.date));
        set({ transactions: allTransactions, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to update transaction', isLoading: false });
      console.error(error);
    }
  },
}));
