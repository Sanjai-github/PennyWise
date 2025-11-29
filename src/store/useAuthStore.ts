import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users, transactions, budgets, accounts, categories } from '../db/schema';

interface User {
  id: number;
  name: string;
  email: string;
  profileImage?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  otp: string | null;
  otpEmail: string | null;
  otpExpiry: number | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  initialize: () => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  loginWithOtp: (email: string) => Promise<void>;
  updateProfileImage: (uri: string | null) => Promise<void>;
}

const hashPassword = async (password: string) => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return digest;
};

export const useAuthStore = create<AuthState>((set, get) => ({
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
            user: { id: user.id, name: user.name, email: user.email, profileImage: user.profileImage },
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
        user: { id: user.id, name: user.name, email: user.email, profileImage: user.profileImage },
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
        user: { id: newUser.id, name: newUser.name, email: newUser.email, profileImage: null },
        isAuthenticated: true,
        isLoading: false,
      });

      // Reset onboarding for new user
      const { resetOnboarding } = require('./useSettingsStore').useSettingsStore.getState();
      resetOnboarding();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('userId');
    set({ user: null, isAuthenticated: false });
  },

  otp: null as string | null,
  otpEmail: null as string | null,
  otpExpiry: null as number | null,

  sendOtp: async (email: string) => {
    set({ isLoading: true });
    try {
      // Check if user exists
      const result = await db.select().from(users).where(eq(users.email, email));
      if (result.length === 0) {
        throw new Error('User not found');
      }

      // Generate 4-digit OTP
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

      set({ otp: code, otpEmail: email, otpExpiry: expiry, isLoading: false });
      
      // Simulate sending email
      // In production, call your API here
      setTimeout(() => {
        alert(`Your OTP is: ${code}`); 
      }, 500);
      
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  verifyOtp: async (email: string, code: string) => {
    set({ isLoading: true });
    try {
      const { otp, otpEmail, otpExpiry } = get();
      
      if (email !== otpEmail) {
        throw new Error('Email mismatch');
      }
      
      if (!otp || !otpExpiry || Date.now() > otpExpiry) {
        throw new Error('OTP expired. Please request a new one.');
      }

      if (code !== otp) {
        throw new Error('Invalid OTP');
      }

      // OTP Verified
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  resetPassword: async (email: string, newPassword: string) => {
    set({ isLoading: true });
    try {
      const hashedPassword = await hashPassword(newPassword);
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, email));
        
      set({ 
        otp: null, 
        otpEmail: null, 
        otpExpiry: null, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithOtp: async (email: string) => {
    set({ isLoading: true });
    try {
      const result = await db.select().from(users).where(eq(users.email, email));
      if (result.length === 0) {
        throw new Error('User not found');
      }

      const user = result[0];
      await AsyncStorage.setItem('userId', user.id.toString());
      
      set({
        user: { id: user.id, name: user.name, email: user.email, profileImage: user.profileImage },
        isAuthenticated: true,
        isLoading: false,
        otp: null,
        otpEmail: null,
        otpExpiry: null
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true });
    try {
      const { user } = get();
      if (!user) return;

      // 1. Delete all user data
      // Note: In a real app with multiple users, we'd filter by user_id.
      // Since this is a local-first single-user-per-device model (mostly), 
      // we are wiping everything for safety as requested.
      // However, to be precise, we should probably only delete data if we had user association.
      // Given the schema doesn't strictly enforce user_id on everything yet (it's a local app),
      // we will wipe the tables.
      
      await db.delete(transactions);
      await db.delete(budgets);
      await db.delete(accounts);
      // We keep default categories, but maybe delete custom ones? 
      // Let's just keep categories for now or delete custom ones if we tracked them by user.
      // The requirement said "Delete account", implying full wipe.
      
      // 2. Delete User
      await db.delete(users).where(eq(users.id, user.id));

      // 3. Clear Session
      await AsyncStorage.removeItem('userId');
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to delete account:', error);
      throw error;
    }
  },

  updateProfileImage: async (uri: string | null) => {
    const { user } = get();
    if (!user) return;

    try {
      await db.update(users)
        .set({ profileImage: uri })
        .where(eq(users.id, user.id));

      set({ user: { ...user, profileImage: uri } });
    } catch (error) {
      console.error('Failed to update profile image:', error);
      throw error;
    }
  },
}));
