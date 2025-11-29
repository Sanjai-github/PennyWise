import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useColorScheme } from 'nativewind';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { Transaction } from '../../db/schema';

interface CategoryBreakdownProps {
  transactions: Transaction[];
  currencySymbol: string;
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ transactions, currencySymbol }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  const byCategory: Record<string, number> = {};
  expenses.forEach(t => {
    const key = t.category;
    byCategory[key] = (byCategory[key] || 0) + t.amount;
  });

  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8B5CF6', '#EC4899'];

  const chartData = Object.keys(byCategory).map((key, index) => ({
    value: byCategory[key],
    color: colors[index % colors.length],
    text: `${Math.round((byCategory[key] / totalExpense) * 100)}%`,
    label: key,
  })).sort((a, b) => b.value - a.value); // Sort by amount descending

  if (totalExpense === 0) {
    return (
      <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-6 items-center shadow-sm border border-light-border dark:border-white/5">
        <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium mb-4 self-start">
          Expense Breakdown
        </Text>
        <View className="h-40 items-center justify-center">
          <Text className="text-gray-400">No expense data yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-6 shadow-sm border border-light-border dark:border-white/5">
      <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium mb-6">
        Expense Breakdown
      </Text>
      
      <View className="items-center mb-8">
        <PieChart
          data={chartData}
          donut
          showGradient
          sectionAutoFocus
          radius={100}
          innerRadius={70}
          innerCircleColor={isDark ? '#1F2937' : '#FFFFFF'}
          centerLabelComponent={() => {
            return (
              <View className="justify-center items-center">
                <Text className="text-xs text-gray-500 mb-1">Total</Text>
                <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                  {currencySymbol}{totalExpense.toFixed(0)}
                </Text>
              </View>
            );
          }}
        />
      </View>

      {/* Detailed List with Chips */}
      <View className="gap-4">
        {chartData.map((item, index) => (
          <View key={index} className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.color }} />
              <Text className="text-light-text dark:text-dark-text font-medium text-base">
                {item.label}
              </Text>
            </View>
            
            <View className="flex-row items-center gap-3">
              <Text className="text-light-text dark:text-dark-text font-bold">
                {currencySymbol}{item.value.toFixed(0)}
              </Text>
              <View className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full">
                <Text className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium">
                  {item.text}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CategoryBreakdown;
