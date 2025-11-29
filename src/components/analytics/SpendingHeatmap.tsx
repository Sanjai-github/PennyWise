import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Calendar } from 'lucide-react-native';
import { Transaction } from '../../db/schema';

interface SpendingHeatmapProps {
  transactions: Transaction[];
}

const SpendingHeatmap: React.FC<SpendingHeatmapProps> = ({ transactions }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width;

  const heatmapData = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const data = new Array(daysInMonth).fill(0);
    
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear() && t.type === 'expense') {
        data[tDate.getDate() - 1] += t.amount;
      }
    });
    
    return data;
  }, [transactions]);

  const maxSpend = Math.max(...heatmapData, 1);

  const getColor = (amount: number) => {
    if (amount === 0) return isDark ? '#1F2937' : '#F3F4F6'; // Gray-800 / Gray-100
    const intensity = amount / maxSpend;
    if (intensity > 0.8) return '#7C3AED'; // Violet-600
    if (intensity > 0.5) return '#8B5CF6'; // Violet-500
    if (intensity > 0.2) return '#A78BFA'; // Violet-400
    return '#C4B5FD'; // Violet-300
  };

  return (
    <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-6 shadow-sm border border-light-border dark:border-white/5">
      <View className="flex-row items-center gap-2 mb-4">
        <Calendar size={20} color={isDark ? '#A78BFA' : '#8B5CF6'} />
        <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
          Daily Spending Heatmap
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-1 justify-center">
        {heatmapData.map((amount, index) => (
          <View
            key={index}
            style={{
              width: (screenWidth - 80) / 7 - 2,
              height: (screenWidth - 80) / 7 - 2,
              backgroundColor: getColor(amount),
              borderRadius: 4,
            }}
          />
        ))}
      </View>
      
      <View className="flex-row justify-between mt-2 px-1">
        <Text className="text-xs text-gray-400">Less</Text>
        <Text className="text-xs text-gray-400">More</Text>
      </View>
    </View>
  );
};

export default SpendingHeatmap;
