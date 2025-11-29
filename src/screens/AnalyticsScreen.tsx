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

const AnalyticsScreen = () => {
  const { transactions, loadTransactions } = useTransactionStore();
  const { budgets, loadBudgets } = useBudgetStore();
  const { currencySymbol } = useSettingsStore();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    loadTransactions();
    loadBudgets();
  }, []);

  return (
    <ScrollView 
      className="flex-1 bg-light-bg dark:bg-dark-bg"
      contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-light-text dark:text-dark-text text-3xl font-bold mb-6" style={{ fontFamily: 'Outfit_700Bold' }}>
        Analytics
      </Text>

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

    </ScrollView>
  );
};

export default AnalyticsScreen;

