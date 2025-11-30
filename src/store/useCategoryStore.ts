import { create } from 'zustand';
import { db } from '../db/client';
import { categories, Category, NewCategory } from '../db/schema';
import { eq } from 'drizzle-orm';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  loadCategories: (userId?: number) => Promise<void>;
  addCategory: (category: NewCategory) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  loadCategories: async (userId?: number) => {
    set({ isLoading: true, error: null });
    try {
      // Load default categories (userId is null) AND user's custom categories
      const allCategories = await db.select().from(categories);
      
      const filteredCategories = allCategories.filter(c => 
        c.userId === null || (userId && c.userId === userId)
      );
      
      set({ categories: filteredCategories, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load categories', isLoading: false });
      console.error(error);
    }
  },

  addCategory: async (newCategory) => {
    set({ isLoading: true, error: null });
    try {
      await db.insert(categories).values(newCategory);
      
      // Reload
      const allCategories = await db.select().from(categories);
      const filteredCategories = allCategories.filter(c => 
        c.userId === null || (newCategory.userId && c.userId === newCategory.userId)
      );
      
      set({ categories: filteredCategories, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add category', isLoading: false });
      console.error(error);
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Get category to check userId
      const category = await db.select().from(categories).where(eq(categories.id, id)).get();
      if (!category) return;

      await db.delete(categories).where(eq(categories.id, id));
      
      // Reload
      const allCategories = await db.select().from(categories);
      const filteredCategories = allCategories.filter(c => 
        c.userId === null || (category.userId && c.userId === category.userId)
      );

      set({ categories: filteredCategories, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to delete category', isLoading: false });
      console.error(error);
    }
  },
}));
