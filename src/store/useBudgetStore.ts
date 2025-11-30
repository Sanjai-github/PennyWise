import { create } from 'zustand';
import { db } from '../db/client';
import { budgets, Budget, NewBudget } from '../db/schema';
import { eq } from 'drizzle-orm';

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  loadBudgets: (userId?: number) => Promise<void>;
  setBudget: (budget: NewBudget) => Promise<void>;
  deleteBudget: (id: number) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  isLoading: false,
  error: null,

  loadBudgets: async (userId?: number) => {
    if (!userId) {
      set({ budgets: [] });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const allBudgets = await db.select().from(budgets).where(eq(budgets.userId, userId));
      set({ budgets: allBudgets, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load budgets', isLoading: false });
      console.error(error);
    }
  },

  setBudget: async (newBudget) => {
    set({ isLoading: true, error: null });
    try {
      // Check if budget for category already exists for this user
      const existing = await db.select().from(budgets)
        .where(eq(budgets.category, newBudget.category))
        // We need to filter by user too, but since we don't have composite keys or complex where clauses easily here without 'and',
        // let's just filter in memory or use raw sql if needed, but drizzle supports 'and'.
        // However, for simplicity let's assume we filter the result.
        // Actually, we should use 'and' from drizzle-orm.
      
      const userBudgets = await db.select().from(budgets)
        .where(eq(budgets.userId, newBudget.userId));
        
      const existingBudget = userBudgets.find(b => b.category === newBudget.category);
      
      if (existingBudget) {
        // Update existing
        await db.update(budgets)
          .set({ 
            amount: newBudget.amount,
            rolloverEnabled: newBudget.rolloverEnabled 
          })
          .where(eq(budgets.id, existingBudget.id));
      } else {
        // Insert new
        await db.insert(budgets).values({
          ...newBudget,
          rolloverEnabled: newBudget.rolloverEnabled || false,
        });
      }

      const allBudgets = await db.select().from(budgets).where(eq(budgets.userId, newBudget.userId));
      set({ budgets: allBudgets, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to set budget', isLoading: false });
      console.error(error);
    }
  },

  deleteBudget: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Get userId before delete to reload
      const budget = await db.select().from(budgets).where(eq(budgets.id, id)).get();
      if (!budget) return;

      await db.delete(budgets).where(eq(budgets.id, id));
      
      const allBudgets = await db.select().from(budgets).where(eq(budgets.userId, budget.userId));
      set({ budgets: allBudgets, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to delete budget', isLoading: false });
      console.error(error);
    }
  },
}));
