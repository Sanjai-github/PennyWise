import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Lightbulb } from 'lucide-react-native';
import { Transaction } from '../../db/schema';
import { generateInsights } from '../../utils/analyticsUtils';

interface SmartInsightsProps {
  transactions: Transaction[];
}

const SmartInsights: React.FC<SmartInsightsProps> = ({ transactions }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const insights = useMemo(() => generateInsights(transactions), [transactions]);

  if (insights.length === 0) return null;

  return (
    <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-6 shadow-sm border border-light-border dark:border-white/5">
      <View className="flex-row items-center gap-2 mb-4">
        <Lightbulb size={20} color={isDark ? '#FBBF24' : '#F59E0B'} />
        <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
          Smart Insights
        </Text>
      </View>

      <View className="gap-3">
        {insights.map((insight, index) => (
          <View key={index} className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/20">
            <Text className="text-light-text dark:text-dark-text text-sm leading-5">
              💡 {insight}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SmartInsights;
