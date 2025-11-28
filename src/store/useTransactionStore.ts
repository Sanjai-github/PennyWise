import { create } from 'zustand';
import { db } from '../db/client';
import { transactions, Transaction, NewTransaction } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  loadTransactions: () => Promise<void>;
  addTransaction: (transaction: NewTransaction) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  updateTransaction: (id: number, data: Partial<NewTransaction>) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  loadTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.date));
      set({ transactions: allTransactions, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load transactions', isLoading: false });
      console.error(error);
    }
  },

  addTransaction: async (newTransaction) => {
    set({ isLoading: true, error: null });
    try {
      await db.insert(transactions).values(newTransaction);
      const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.date));
      set({ transactions: allTransactions, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add transaction', isLoading: false });
      console.error(error);
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.delete(transactions).where(eq(transactions.id, id));
      const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.date));
      set({ transactions: allTransactions, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to delete transaction', isLoading: false });
      console.error(error);
    }
  },

  updateTransaction: async (id: number, data: Partial<NewTransaction>) => {
    set({ isLoading: true, error: null });
    try {
      await db.update(transactions).set(data).where(eq(transactions.id, id));
      const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.date));
      set({ transactions: allTransactions, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update transaction', isLoading: false });
      console.error(error);
    }
  },
}));
