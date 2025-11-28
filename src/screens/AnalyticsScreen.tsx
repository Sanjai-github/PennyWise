import React, { useMemo } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useTransactionStore } from '../store/useTransactionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useColorScheme } from 'nativewind';

const AnalyticsScreen = () => {
  const { transactions } = useTransactionStore();
  const { currencySymbol } = useSettingsStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width;

  // --- Data Processing ---

  // 1. Expense by Category (Pie Chart)
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

    const byCategory: Record<string, number> = {};
    expenses.forEach(t => {
      // Use categoryId or a default name if we had category names. 
      // For now, let's group by categoryId. Ideally we map IDs to names/icons.
      // Assuming we have a categoryId on transaction.
      const key = t.category; 
      byCategory[key] = (byCategory[key] || 0) + t.amount;
    });

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    
    return Object.keys(byCategory).map((key, index) => ({
      value: byCategory[key],
      color: colors[index % colors.length],
      text: `${Math.round((byCategory[key] / totalExpense) * 100)}%`,
      label: key, // We might need a legend instead of on-chart labels for small slices
    }));
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // 2. Monthly Trend (Bar Chart) - Last 6 months
  const barData = useMemo(() => {
    // Mocking some data for visualization if empty, or aggregating real data
    // Real aggregation:
    const last6Months = new Array(6).fill(0).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        value: 0
      };
    }).reverse();

    transactions.filter(t => t.type === 'expense').forEach(t => {
      const tDate = new Date(t.date);
      const monthStr = tDate.toLocaleString('default', { month: 'short' });
      const year = tDate.getFullYear();
      
      const monthData = last6Months.find(m => m.month === monthStr && m.year === year);
      if (monthData) {
        monthData.value += t.amount;
      }
    });

    return last6Months.map(m => ({
      value: m.value,
      label: m.month,
      frontColor: '#7C3AED', // Violet-600
    }));
  }, [transactions]);


  return (
    <ScrollView className="flex-1 bg-light-bg dark:bg-dark-bg p-6 pt-16">
      <Text className="text-light-text dark:text-dark-text text-2xl font-bold mb-6" style={{ fontFamily: 'Outfit_700Bold' }}>
        Analytics
      </Text>

      {/* Pie Chart Section */}
      <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-6 items-center shadow-sm">
        <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium mb-4 self-start">
          Expense Breakdown
        </Text>
        
        {totalExpense > 0 ? (
          <View className="items-center">
             <PieChart
              data={categoryData}
              donut
              showGradient
              sectionAutoFocus
              radius={90}
              innerRadius={60}
              innerCircleColor={isDark ? '#1F2937' : '#FFFFFF'}
              centerLabelComponent={() => {
                return (
                  <View className="justify-center items-center">
                    <Text className="text-xs text-gray-500">Total</Text>
                    <Text className="text-lg font-bold text-light-text dark:text-dark-text">
                      {currencySymbol}{totalExpense.toFixed(0)}
                    </Text>
                  </View>
                );
              }}
            />
            {/* Legend */}
            <View className="flex-row flex-wrap justify-center gap-4 mt-6">
              {categoryData.map((item, index) => (
                <View key={index} className="flex-row items-center gap-2">
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
                  <Text className="text-xs text-light-text dark:text-dark-text">{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="h-40 items-center justify-center">
            <Text className="text-gray-400">No expense data yet</Text>
          </View>
        )}
      </View>

      {/* Bar Chart Section */}
      <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-24 shadow-sm">
        <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium mb-4">
          Monthly Spending
        </Text>
        <View className="items-center overflow-hidden">
          <BarChart
            data={barData}
            barWidth={22}
            noOfSections={3}
            barBorderRadius={4}
            frontColor="#7C3AED"
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisTextStyle={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            xAxisLabelTextStyle={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            hideRules
            width={screenWidth - 100} // Adjust width to fit container
            height={180}
            isAnimated
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default AnalyticsScreen;
