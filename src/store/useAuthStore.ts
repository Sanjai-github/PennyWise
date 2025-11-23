import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users } from '../db/schema';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

const hashPassword = async (password: string) => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return digest;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  initialize: async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const result = await db.select().from(users).where(eq(users.id, parseInt(userId)));
        if (result.length > 0) {
          const user = result[0];
          set({
            user: { id: user.id, name: user.name, email: user.email },
            isAuthenticated: true,
          });
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const hashedPassword = await hashPassword(password);
      const result = await db.select().from(users).where(eq(users.email, email));
      
      if (result.length === 0) {
        throw new Error('User not found');
      }

      const user = result[0];
      if (user.password !== hashedPassword) {
        throw new Error('Invalid password');
      }

      await AsyncStorage.setItem('userId', user.id.toString());
      set({
        user: { id: user.id, name: user.name, email: user.email },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true });
    try {
      // Check if user exists
      const existing = await db.select().from(users).where(eq(users.email, email));
      if (existing.length > 0) {
        throw new Error('Email already registered');
      }

      const hashedPassword = await hashPassword(password);
      const result = await db.insert(users).values({
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      }).returning();

      const newUser = result[0];
      await AsyncStorage.setItem('userId', newUser.id.toString());
      
      set({
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('userId');
    set({ user: null, isAuthenticated: false });
  },
}));
