import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Trophy, TrendingUp } from 'lucide-react-native';
import { Transaction, Budget } from '../../db/schema';
import { calculateFinancialScore } from '../../utils/analyticsUtils';
import { LinearGradient } from 'expo-linear-gradient';

interface FinancialScoreProps {
  transactions: Transaction[];
  budgets: Budget[];
}

const FinancialScore: React.FC<FinancialScoreProps> = ({ transactions, budgets }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const score = useMemo(() => calculateFinancialScore(transactions, budgets), [transactions, budgets]);

  const getScoreColor = (): [string, string, ...string[]] => {
    if (score >= 80) return ['#10B981', '#34D399']; // Green
    if (score >= 60) return ['#F59E0B', '#FBBF24']; // Yellow
    return ['#EF4444', '#F87171']; // Red
  };

  const getBadge = () => {
    if (score >= 80) return 'Financial Guru';
    if (score >= 60) return 'Smart Saver';
    if (score >= 40) return 'On Track';
    return 'Needs Attention';
  };

  const colors = getScoreColor();

  return (
    <View className="bg-light-surface dark:bg-dark-surface rounded-3xl p-6 mb-6 shadow-sm border border-light-border dark:border-white/5 overflow-hidden relative">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium mb-1">
            Financial Score
          </Text>
          <Text className="text-3xl font-bold text-light-text dark:text-dark-text">
            {score}<Text className="text-lg text-gray-400">/100</Text>
          </Text>
        </View>
        <View className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
          <Trophy size={24} color="#F59E0B" />
        </View>
      </View>

      {/* Progress Bar */}
      <View 
        className="bg-gray-100 dark:bg-white/10 rounded-full mb-4 overflow-hidden"
        style={{ height: 12, width: '100%' }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: `${score}%`, height: '100%' }}
        />
      </View>

      <View className="flex-row items-center gap-2 bg-light-bg dark:bg-white/5 self-start px-3 py-1.5 rounded-lg">
        <TrendingUp size={14} color={isDark ? '#FFF' : '#000'} />
        <Text className="text-sm font-medium text-light-text dark:text-dark-text">
          Badge: {getBadge()}
        </Text>
      </View>
    </View>
  );
};

export default FinancialScore;
