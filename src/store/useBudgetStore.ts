import { create } from 'zustand';
import { db } from '../db/client';
import { budgets, Budget, NewBudget } from '../db/schema';
import { eq } from 'drizzle-orm';

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  loadBudgets: () => Promise<void>;
  setBudget: (budget: NewBudget) => Promise<void>;
  deleteBudget: (id: number) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  isLoading: false,
  error: null,

  loadBudgets: async () => {
    set({ isLoading: true, error: null });
    try {
      const allBudgets = await db.select().from(budgets);
      set({ budgets: allBudgets, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load budgets', isLoading: false });
      console.error(error);
    }
  },

  setBudget: async (newBudget) => {
    set({ isLoading: true, error: null });
    try {
      // Check if budget for category already exists
      const existing = await db.select().from(budgets).where(eq(budgets.category, newBudget.category));
      
      if (existing.length > 0) {
        // Update existing
        await db.update(budgets)
          .set({ 
            amount: newBudget.amount,
            rolloverEnabled: newBudget.rolloverEnabled 
          })
          .where(eq(budgets.id, existing[0].id));
      } else {
        // Insert new
        await db.insert(budgets).values({
          ...newBudget,
          rolloverEnabled: newBudget.rolloverEnabled || false,
        });
      }

      const allBudgets = await db.select().from(budgets);
      set({ budgets: allBudgets, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to set budget', isLoading: false });
      console.error(error);
    }
  },

  deleteBudget: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.delete(budgets).where(eq(budgets.id, id));
      const allBudgets = await db.select().from(budgets);
      set({ budgets: allBudgets, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to delete budget', isLoading: false });
      console.error(error);
    }
  },
}));
