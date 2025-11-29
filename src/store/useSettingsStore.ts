import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  currency: string;
  currencySymbol: string;
  isBiometricEnabled: boolean;
  biometricUserId: number | null;
  isOnboardingCompleted: boolean;
  setCurrency: (currency: string) => void;
  toggleBiometric: (enabled: boolean, userId?: number | null) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const getSymbol = (currency: string) => {
  switch (currency) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    default: return '$';
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'INR',
      currencySymbol: '₹',
      isBiometricEnabled: false,
      biometricUserId: null,
      isOnboardingCompleted: false,
      setCurrency: (currency) => set({ currency, currencySymbol: getSymbol(currency) }),
      toggleBiometric: (enabled, userId = null) => set({ isBiometricEnabled: enabled, biometricUserId: userId }),
      completeOnboarding: () => set({ isOnboardingCompleted: true }),
      resetOnboarding: () => set({ isOnboardingCompleted: false }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
