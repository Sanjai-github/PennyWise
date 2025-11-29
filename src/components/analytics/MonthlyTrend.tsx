import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useColorScheme } from 'nativewind';
import { Transaction } from '../../db/schema';

interface MonthlyTrendProps {
  transactions: Transaction[];
  currencySymbol: string;
}

const MonthlyTrend: React.FC<MonthlyTrendProps> = ({ transactions, currencySymbol }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width;

  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'savings'>('expense');

  const chartData = useMemo(() => {
    const last6Months = new Array(6).fill(0).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        income: 0,
        expense: 0,
        savings: 0,
      };
    }).reverse();

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const monthStr = tDate.toLocaleString('default', { month: 'short' });
      const year = tDate.getFullYear();
      
      const monthData = last6Months.find(m => m.month === monthStr && m.year === year);
      if (monthData) {
        if (t.type === 'income') monthData.income += t.amount;
        else monthData.expense += t.amount;
      }
    });

    // Calculate savings
    last6Months.forEach(m => {
      m.savings = Math.max(0, m.income - m.expense);
    });

    return last6Months.map(m => {
      const val = activeTab === 'expense' ? m.expense : activeTab === 'income' ? m.income : m.savings;
      return {
        value: val,
        label: m.month,
        dataPointText: val > 0 ? val.toString() : '',
      };
    });
  }, [transactions, activeTab]);

  const getChartColor = () => {
    switch (activeTab) {
      case 'income': return '#10B981'; // Emerald-500
      case 'savings': return '#3B82F6'; // Blue-500
      default: return '#EF4444'; // Red-500
    }
  };

  const color = getChartColor();

  return (
    <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-6 shadow-sm border border-light-border dark:border-white/5">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
          Monthly Trend
        </Text>
      </View>

      {/* Toggles */}
      <View className="flex-row bg-gray-100 dark:bg-white/5 p-1 rounded-xl mb-6">
        {(['expense', 'income', 'savings'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === tab ? 'bg-white dark:bg-white/10 shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-semibold capitalize ${activeTab === tab ? 'text-light-text dark:text-dark-text' : 'text-gray-400'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="items-center -ml-4">
        <LineChart
          data={chartData}
          curved
          thickness={3}
          color={color}
          hideDataPoints={false}
          dataPointsColor={color}
          dataPointsRadius={4}
          hideRules
          hideYAxisText
          xAxisLabelTextStyle={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
          width={screenWidth - 80}
          height={180}
          initialSpacing={20}
          spacing={(screenWidth - 100) / 6}
          startFillColor={`${color}40`}
          endFillColor={`${color}05`}
          startOpacity={0.9}
          endOpacity={0.1}
          areaChart
        />
      </View>
    </View>
  );
};

export default MonthlyTrend;
