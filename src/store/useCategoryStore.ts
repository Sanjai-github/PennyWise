import { create } from 'zustand';
import { db } from '../db/client';
import { categories, Category, NewCategory } from '../db/schema';
import { eq } from 'drizzle-orm';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  loadCategories: () => Promise<void>;
  addCategory: (category: NewCategory) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  loadCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const allCategories = await db.select().from(categories);
      set({ categories: allCategories, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load categories', isLoading: false });
      console.error(error);
    }
  },

  addCategory: async (newCategory) => {
    set({ isLoading: true, error: null });
    try {
      await db.insert(categories).values(newCategory);
      const allCategories = await db.select().from(categories);
      set({ categories: allCategories, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add category', isLoading: false });
      console.error(error);
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.delete(categories).where(eq(categories.id, id));
      const allCategories = await db.select().from(categories);
      set({ categories: allCategories, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to delete category', isLoading: false });
      console.error(error);
    }
  },
}));
