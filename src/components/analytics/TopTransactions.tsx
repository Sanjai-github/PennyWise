import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { TrendingUp } from 'lucide-react-native';
import { Transaction } from '../../db/schema';
import TransactionItem from '../TransactionItem';

interface TopTransactionsProps {
  transactions: Transaction[];
}

const TopTransactions: React.FC<TopTransactionsProps> = ({ transactions }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const topTransactions = useMemo(() => {
    return [...transactions]
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  if (topTransactions.length === 0) return null;

  return (
    <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-6 shadow-sm border border-light-border dark:border-white/5">
      <View className="flex-row items-center gap-2 mb-4">
        <TrendingUp size={20} color={isDark ? '#EF4444' : '#DC2626'} />
        <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
          Biggest Spends
        </Text>
      </View>

      <View className="gap-2">
        {topTransactions.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </View>
    </View>
  );
};

export default TopTransactions;
