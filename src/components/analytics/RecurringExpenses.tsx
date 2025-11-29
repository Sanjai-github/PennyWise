import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { RefreshCcw } from 'lucide-react-native';
import { Transaction } from '../../db/schema';
import { detectRecurringExpenses } from '../../utils/analyticsUtils';

interface RecurringExpensesProps {
  transactions: Transaction[];
  currencySymbol: string;
}

const RecurringExpenses: React.FC<RecurringExpensesProps> = ({ transactions, currencySymbol }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const recurring = useMemo(() => detectRecurringExpenses(transactions), [transactions]);
  const totalRecurring = recurring.reduce((sum, item) => sum + item.amount, 0);

  if (recurring.length === 0) return null;

  return (
    <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-6 shadow-sm border border-light-border dark:border-white/5">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-2">
          <RefreshCcw size={20} color={isDark ? '#A78BFA' : '#8B5CF6'} />
          <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
            Recurring Payments
          </Text>
        </View>
        <Text className="text-light-text dark:text-dark-text font-bold">
          {currencySymbol}{totalRecurring.toFixed(0)}/mo
        </Text>
      </View>

      <Text className="text-xs text-gray-400 mb-4">
        Cancel unwanted subscriptions to save more.
      </Text>

      <View className="gap-3">
        {recurring.map((item, index) => (
          <View key={index} className="flex-row justify-between items-center bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
            <View>
              <Text className="text-light-text dark:text-dark-text font-medium capitalize">
                {item.name}
              </Text>
              <Text className="text-xs text-gray-400">
                {item.frequency}
              </Text>
            </View>
            <Text className="text-light-text dark:text-dark-text font-bold">
              {currencySymbol}{item.amount.toFixed(0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default RecurringExpenses;
