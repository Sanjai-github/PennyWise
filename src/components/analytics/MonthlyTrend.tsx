import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useColorScheme } from 'nativewind';
import { Transaction } from '../../db/schema';
import { ChevronDown } from 'lucide-react-native';

interface MonthlyTrendProps {
  transactions: Transaction[];
  currencySymbol: string;
}

const MonthlyTrend: React.FC<MonthlyTrendProps> = ({ transactions, currencySymbol }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width;

  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'savings'>('expense');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleSelect = (tab: 'expense' | 'income' | 'savings') => {
    setActiveTab(tab);
    setIsDropdownOpen(false);
  };

  return (
    <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-6 shadow-sm border border-light-border dark:border-white/5 z-50">
      <View className="flex-row justify-between items-center mb-6 z-50">
        <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
          Monthly Trend
        </Text>
        
        <View className="relative z-50">
          <TouchableOpacity 
            onPress={toggleDropdown}
            className="flex-row items-center gap-2 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full"
          >
            <Text className="text-sm font-semibold capitalize text-light-text dark:text-dark-text">
              {activeTab}
            </Text>
            <ChevronDown size={16} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          {isDropdownOpen && (
            <View className="absolute top-10 right-0 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
              {(['expense', 'income', 'savings'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => handleSelect(tab)}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 ${activeTab === tab ? 'bg-gray-50 dark:bg-white/5' : ''}`}
                >
                  <Text className={`text-sm capitalize ${activeTab === tab ? 'font-semibold text-light-text dark:text-dark-text' : 'text-gray-500 dark:text-gray-400'}`}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <View className="items-center -ml-4 -z-10">
        <LineChart
          key={activeTab}
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
