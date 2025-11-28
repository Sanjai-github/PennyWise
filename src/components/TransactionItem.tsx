import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Transaction } from '../db/schema';
import { ShoppingBag, Coffee, Home, Car, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

interface TransactionItemProps {
  transaction: Transaction;
  onLongPress?: () => void;
}

const getCategoryIcon = (category: string, color: string) => {
  const size = 20;
  switch (category.toLowerCase()) {
    case 'food': return <Coffee size={size} color={color} />;
    case 'shopping': return <ShoppingBag size={size} color={color} />;
    case 'housing': return <Home size={size} color={color} />;
    case 'transport': return <Car size={size} color={color} />;
    default: return <DollarSign size={size} color={color} />;
  }
};

import { useSettingsStore } from '../store/useSettingsStore';

// ...

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onLongPress }) => {
  const { currencySymbol } = useSettingsStore();
  const isExpense = transaction.type === 'expense';
  const amountColor = isExpense ? 'text-error' : 'text-success';
  const iconColor = isExpense ? '#F44336' : '#4CAF50';
  const iconBg = isExpense ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20';

  const Container = onLongPress ? TouchableOpacity : View;

  return (
    <Container 
      onLongPress={onLongPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-3 border-b border-light-border dark:border-dark-border last:border-0"
    >
      <View className="flex-row items-center gap-3">
        <View className={`w-10 h-10 rounded-full items-center justify-center ${iconBg}`}>
          {getCategoryIcon(transaction.category, iconColor)}
        </View>
        <View>
          <Text className="text-light-text dark:text-dark-text font-medium text-base">
            {transaction.category}
          </Text>
          <Text className="text-light-text-secondary dark:text-dark-text-secondary text-xs">
            {transaction.note || new Date(transaction.date).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className={`font-bold text-base ${amountColor}`}>
          {isExpense ? '-' : '+'}{currencySymbol}{transaction.amount.toFixed(2)}
        </Text>
        <Text className="text-light-text-secondary dark:text-dark-text-secondary text-xs">
          {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Container>
  );
};

export default TransactionItem;
