import { create } from 'zustand';
import { db } from '../db/client';
import { accounts, NewAccount, transactions } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

interface AccountState {
  accounts: typeof accounts.$inferSelect[];
  currency: string;
  isLoading: boolean;
  error: string | null;
  loadAccounts: () => Promise<void>;
  addAccount: (account: NewAccount) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  recalculateBalance: () => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  currency: 'INR',
  isLoading: false,
  error: null,

  loadAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const allAccounts = await db.select().from(accounts);
      set({ accounts: allAccounts, isLoading: false });
      if (allAccounts.length > 0) {
        set({ currency: allAccounts[0].currency });
      }
    } catch (error) {
      set({ error: 'Failed to load accounts', isLoading: false });
      console.error(error);
    }
  },

  addAccount: async (newAccount) => {
    set({ isLoading: true, error: null });
    try {
      await db.insert(accounts).values(newAccount);
      const allAccounts = await db.select().from(accounts);
      set({ accounts: allAccounts, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add account', isLoading: false });
      console.error(error);
    }
  },

  deleteAccount: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.delete(accounts).where(eq(accounts.id, id));
      const allAccounts = await db.select().from(accounts);
      set({ accounts: allAccounts, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to delete account', isLoading: false });
      console.error(error);
    }
  },

  recalculateBalance: async () => {
    try {
      const allAccounts = await db.select().from(accounts);
      
      for (const account of allAccounts) {
        const result = await db
          .select({
            income: sql<number>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end), 0)`,
            expense: sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amount} else 0 end), 0)`
          })
          .from(transactions)
          .where(eq(transactions.accountId, account.id))
          .get();

        if (result) {
          const newBalance = result.income - result.expense;
          if (newBalance !== account.balance) {
            await db.update(accounts)
              .set({ balance: newBalance })
              .where(eq(accounts.id, account.id));
          }
        }
      }
      // Reload accounts to reflect changes
      await get().loadAccounts();
    } catch (error) {
      console.error('Failed to recalculate balance:', error);
    }
  },

  setCurrency: async (currency) => {
    set({ currency });
    try {
      // Update currency for all accounts (simplification for single-currency app)
      await db.update(accounts).set({ currency });
    } catch (error) {
      console.error('Failed to update currency:', error);
    }
  }
}));
