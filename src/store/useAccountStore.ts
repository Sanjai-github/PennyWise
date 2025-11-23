import { create } from 'zustand';
import { db } from '../db/client';
import { accounts, Account, NewAccount } from '../db/schema';
import { eq } from 'drizzle-orm';

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  loadAccounts: () => Promise<void>;
  addAccount: (account: NewAccount) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  isLoading: false,
  error: null,

  loadAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const allAccounts = await db.select().from(accounts);
      set({ accounts: allAccounts, isLoading: false });
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
}));
