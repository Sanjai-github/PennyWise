import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react-native';
import { Transaction } from '../../db/schema';

interface CashflowCardProps {
  transactions: Transaction[];
  currencySymbol: string;
}

const CashflowCard: React.FC<CashflowCardProps> = ({ transactions, currencySymbol }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { income, expense, net } = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const exp = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income: inc, expense: exp, net: inc - exp };
  }, [transactions]);

  return (
    <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-6 shadow-sm border border-light-border dark:border-white/5">
      <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium mb-4">
        Cashflow Summary
      </Text>

      <View className="flex-row justify-between">
        <View className="items-center flex-1">
          <View className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mb-2">
            <TrendingUp size={20} color="#10B981" />
          </View>
          <Text className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Income</Text>
          <Text className="text-light-text dark:text-dark-text font-bold">
            {currencySymbol}{income.toFixed(0)}
          </Text>
        </View>

        <View className="w-[1px] bg-gray-200 dark:bg-white/10 h-full mx-2" />

        <View className="items-center flex-1">
          <View className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mb-2">
            <TrendingDown size={20} color="#EF4444" />
          </View>
          <Text className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Expense</Text>
          <Text className="text-light-text dark:text-dark-text font-bold">
            {currencySymbol}{expense.toFixed(0)}
          </Text>
        </View>

        <View className="w-[1px] bg-gray-200 dark:bg-white/10 h-full mx-2" />

        <View className="items-center flex-1">
          <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mb-2">
            <DollarSign size={20} color="#3B82F6" />
          </View>
          <Text className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Net</Text>
          <Text className={`font-bold ${net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {net >= 0 ? '+' : ''}{currencySymbol}{net.toFixed(0)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CashflowCard;
