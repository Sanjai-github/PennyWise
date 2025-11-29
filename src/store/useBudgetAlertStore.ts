import { create } from 'zustand';

interface BudgetAlertData {
  category: string;
  remainingBefore: number;
  transactionAmount: number;
  limit: number;
}

interface BudgetAlertState {
  visible: boolean;
  data: BudgetAlertData | null;
  showAlert: (data: BudgetAlertData) => void;
  hideAlert: () => void;
}

export const useBudgetAlertStore = create<BudgetAlertState>((set) => ({
  visible: false,
  data: null,
  showAlert: (data) => set({ visible: true, data }),
  hideAlert: () => set({ visible: false }),
}));
