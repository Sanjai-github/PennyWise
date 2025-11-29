import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Target } from 'lucide-react-native';
import { Transaction, Budget } from '../../db/schema';

interface BudgetOverviewProps {
  transactions: Transaction[];
  budgets: Budget[];
  currencySymbol: string;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ transactions, budgets, currencySymbol }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const budgetData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return budgets.map(budget => {
      const spent = transactions
        .filter(t => 
          t.category === budget.category && 
          t.type === 'expense' &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...budget,
        spent,
        percentage: Math.min(100, (spent / budget.amount) * 100)
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [transactions, budgets]);

  if (budgets.length === 0) return null;

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0);
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-6 shadow-sm border border-light-border dark:border-white/5">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-2">
          <Target size={20} color={isDark ? '#F472B6' : '#EC4899'} />
          <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
            Budget Overview
          </Text>
        </View>
        <Text className="text-light-text dark:text-dark-text font-bold">
          {totalPercentage.toFixed(0)}% Used
        </Text>
      </View>

      <View className="gap-4">
        {budgetData.slice(0, 3).map((item, index) => (
          <View key={index}>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-light-text dark:text-dark-text font-medium">
                {item.category}
              </Text>
              <Text className="text-xs text-gray-400">
                {currencySymbol}{item.spent.toFixed(0)} / {currencySymbol}{item.amount.toFixed(0)}
              </Text>
            </View>
            <View 
              className="bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden"
              style={{ height: 8, width: '100%' }}
            >
              <View 
                className={`h-full rounded-full ${item.percentage >= 100 ? 'bg-red-500' : item.percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${item.percentage}%` }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default BudgetOverview;
