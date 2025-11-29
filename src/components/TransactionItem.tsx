import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Transaction } from '../db/schema';
import { ShoppingBag, Coffee, Home, Car, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { useColorScheme } from 'nativewind';

interface TransactionItemProps {
  transaction: Transaction;
  onLongPress?: (transaction: Transaction) => void;
  onPress?: () => void;
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

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onLongPress, onPress }) => {
  const { currencySymbol } = useSettingsStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const isIncome = transaction.type === 'income';
  const categoryColor = isIncome ? '#10B981' : '#F43F5E';

  // For glassmorphism, we want transparent backgrounds in dark mode
  // and solid backgrounds in light mode
  const IconComponent = isIncome ? ArrowUpRight : ArrowDownLeft;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={() => onLongPress && onLongPress(transaction)}
      activeOpacity={0.7}
      className="flex-row items-center justify-between p-4 border-b border-light-border dark:border-white/5 last:border-0"
    >
      <View className="flex-row items-center gap-3">
        <View 
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: isDark ? `${categoryColor}20` : `${categoryColor}20` }}
        >
          {getCategoryIcon(transaction.category, categoryColor)}
        </View>
        <View>
          <Text className="text-light-text dark:text-white font-medium text-base">
            {transaction.category}
          </Text>
          <Text className="text-light-text-secondary dark:text-white/60 text-xs">
            {new Date(transaction.date).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text 
        className={`font-bold text-base ${
          isIncome ? 'text-green-600 dark:text-emerald-400' : 'text-red-600 dark:text-rose-400'
        }`}
      >
        {isIncome ? '+' : '-'}{currencySymbol}{transaction.amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
};

export default TransactionItem;
