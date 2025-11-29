import { create } from 'zustand';
import { db } from '../db/client';
import { goals, goalsWallet, Goal, NewGoal, GoalsWallet } from '../db/schema';
import { eq } from 'drizzle-orm';

interface GoalState {
  goals: Goal[];
  walletBalance: number;
  isLoading: boolean;
  error: string | null;
  
  loadGoals: () => Promise<void>;
  addGoal: (goal: NewGoal) => Promise<void>;
  updateGoal: (id: number, data: Partial<NewGoal>) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
  
  loadWallet: () => Promise<void>;
  addToWallet: (amount: number) => Promise<void>;
  withdrawFromWallet: (amount: number) => Promise<void>;
  allocateToGoal: (goalId: number, amount: number) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  walletBalance: 0,
  isLoading: false,
  error: null,

  loadGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const allGoals = await db.select().from(goals);
      set({ goals: allGoals, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load goals', isLoading: false });
      console.error(error);
    }
  },

  addGoal: async (newGoal) => {
    set({ isLoading: true, error: null });
    try {
      await db.insert(goals).values(newGoal);
      const allGoals = await db.select().from(goals);
      set({ goals: allGoals, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add goal', isLoading: false });
      console.error(error);
    }
  },

  updateGoal: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await db.update(goals).set(data).where(eq(goals.id, id));
      const allGoals = await db.select().from(goals);
      set({ goals: allGoals, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update goal', isLoading: false });
      console.error(error);
    }
  },

  deleteGoal: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.transaction(async (tx) => {
        // 1. Get goal details
        const goal = await tx.select().from(goals).where(eq(goals.id, id)).get();
        if (!goal) return;

        // 2. Refund to Wallet if there's money in the goal
        if (goal.currentAmount > 0) {
          const wallet = await tx.select().from(goalsWallet).limit(1);
          if (wallet.length > 0) {
            await tx.update(goalsWallet)
              .set({ 
                balance: wallet[0].balance + goal.currentAmount,
                updatedAt: new Date() 
              })
              .where(eq(goalsWallet.id, wallet[0].id));
          }
        }

        // 3. Delete Goal
        await tx.delete(goals).where(eq(goals.id, id));
      });

      // Refresh state
      const allGoals = await db.select().from(goals);
      const wallet = await db.select().from(goalsWallet).limit(1);
      
      set({ 
        goals: allGoals, 
        walletBalance: wallet[0]?.balance ?? 0,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to delete goal', isLoading: false });
      console.error(error);
    }
  },

  loadWallet: async () => {
    try {
      const wallet = await db.select().from(goalsWallet).limit(1);
      if (wallet.length > 0) {
        set({ walletBalance: wallet[0].balance });
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  },

  addToWallet: async (amount) => {
    try {
      const wallet = await db.select().from(goalsWallet).limit(1);
      if (wallet.length > 0) {
        const newBalance = wallet[0].balance + amount;
        await db.update(goalsWallet)
          .set({ balance: newBalance, updatedAt: new Date() })
          .where(eq(goalsWallet.id, wallet[0].id));
        set({ walletBalance: newBalance });
      }
    } catch (error) {
      console.error('Failed to add to wallet:', error);
    }
  },

  withdrawFromWallet: async (amount) => {
    try {
      const wallet = await db.select().from(goalsWallet).limit(1);
      if (wallet.length > 0) {
        const newBalance = Math.max(0, wallet[0].balance - amount);
        await db.update(goalsWallet)
          .set({ balance: newBalance, updatedAt: new Date() })
          .where(eq(goalsWallet.id, wallet[0].id));
        set({ walletBalance: newBalance });
      }
    } catch (error) {
      console.error('Failed to withdraw from wallet:', error);
    }
  },

  allocateToGoal: async (goalId, amount) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Withdraw from Wallet
      const wallet = await db.select().from(goalsWallet).limit(1);
      if (!wallet.length || wallet[0].balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      await db.transaction(async (tx) => {
        // Update Wallet
        await tx.update(goalsWallet)
          .set({ balance: wallet[0].balance - amount, updatedAt: new Date() })
          .where(eq(goalsWallet.id, wallet[0].id));

        // Update Goal
        const goal = await tx.select().from(goals).where(eq(goals.id, goalId)).get();
        if (goal) {
          await tx.update(goals)
            .set({ currentAmount: goal.currentAmount + amount })
            .where(eq(goals.id, goalId));
        }
      });

      // Refresh State
      await get().loadWallet();
      await get().loadGoals();
      
    } catch (error: any) {
      set({ error: error.message || 'Failed to allocate funds', isLoading: false });
      console.error(error);
    }
  }
}));
