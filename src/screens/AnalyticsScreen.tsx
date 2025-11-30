import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTransactionStore } from '../store/useTransactionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useColorScheme } from 'nativewind';

// Components
import CategoryBreakdown from '../components/analytics/CategoryBreakdown';
import MonthlyTrend from '../components/analytics/MonthlyTrend';
import FinancialScore from '../components/analytics/FinancialScore';
import RecurringExpenses from '../components/analytics/RecurringExpenses';
import SmartInsights from '../components/analytics/SmartInsights';
import TopTransactions from '../components/analytics/TopTransactions';
import SpendingHeatmap from '../components/analytics/SpendingHeatmap';
import CashflowCard from '../components/analytics/CashflowCard';
import SavingsCard from '../components/analytics/SavingsCard';
import BudgetOverview from '../components/analytics/BudgetOverview';
import { useAuthStore } from '../store/useAuthStore';

const AnalyticsScreen = () => {
  const { transactions, loadTransactions } = useTransactionStore();
  const { budgets, loadBudgets } = useBudgetStore();
  const { currencySymbol } = useSettingsStore();
  const { colorScheme } = useColorScheme();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      loadTransactions(user.id);
      loadBudgets(user.id);
    }
  }, [user]);

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg pt-16 px-6">
      <Text className="text-light-text dark:text-dark-text text-2xl font-bold mb-8" style={{ fontFamily: 'Outfit_700Bold' }}>
        Analytics
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. Financial Score (Gamification) */}
        <FinancialScore transactions={transactions} budgets={budgets} />

        {/* 2. Cashflow Summary */}
        <CashflowCard transactions={transactions} currencySymbol={currencySymbol} />

        {/* 3. Savings Insights */}
        <SavingsCard transactions={transactions} currencySymbol={currencySymbol} />

        {/* 4. Monthly Trendline */}
        <MonthlyTrend transactions={transactions} currencySymbol={currencySymbol} />

        {/* 5. Category Breakdown */}
        <CategoryBreakdown transactions={transactions} currencySymbol={currencySymbol} />

        {/* 6. Budget Overview */}
        <BudgetOverview transactions={transactions} budgets={budgets} currencySymbol={currencySymbol} />

        {/* 7. Spending Heatmap */}
        <SpendingHeatmap transactions={transactions} />

        {/* 8. Smart Insights */}
        <SmartInsights transactions={transactions} />

        {/* 9. Recurring Expenses */}
        <RecurringExpenses transactions={transactions} currencySymbol={currencySymbol} />

        {/* 10. Top Transactions */}
        <TopTransactions transactions={transactions} />
        
        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default AnalyticsScreen;

