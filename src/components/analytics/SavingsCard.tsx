import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { Transaction } from '../../db/schema';

interface SavingsCardProps {
  transactions: Transaction[];
  currencySymbol: string;
}

const SavingsCard: React.FC<SavingsCardProps> = ({ transactions, currencySymbol }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { currentSavings, lastMonthSavings, savingsRate } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let currentInc = 0, currentExp = 0, lastInc = 0, lastExp = 0;

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (t.type === 'income') currentInc += t.amount;
        else currentExp += t.amount;
      } else if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
        if (t.type === 'income') lastInc += t.amount;
        else lastExp += t.amount;
      }
    });

    const currSav = Math.max(0, currentInc - currentExp);
    const lastSav = Math.max(0, lastInc - lastExp);
    const rate = currentInc > 0 ? (currSav / currentInc) * 100 : 0;

    return { currentSavings: currSav, lastMonthSavings: lastSav, savingsRate: rate };
  }, [transactions]);

  const diff = currentSavings - lastMonthSavings;
  const diffPercent = lastMonthSavings > 0 ? (diff / lastMonthSavings) * 100 : 0;

  return (
    <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-6 shadow-sm border border-light-border dark:border-white/5">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-2">
          <PiggyBank size={20} color={isDark ? '#34D399' : '#10B981'} />
          <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
            This Month's Savings
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-full ${diff >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
          <Text className={`text-xs font-bold ${diff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {diff >= 0 ? '+' : ''}{diffPercent.toFixed(0)}%
          </Text>
        </View>
      </View>

      <Text className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
        {currencySymbol}{currentSavings.toFixed(0)}
      </Text>

      <Text className="text-sm text-gray-400">
        You saved <Text className="font-bold text-light-text dark:text-dark-text">{savingsRate.toFixed(0)}%</Text> of your income.
      </Text>
    </View>
  );
};

export default SavingsCard;
