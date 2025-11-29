import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTransactionStore } from '../store/useTransactionStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import ProgressBar from '../components/ProgressBar';
import SetBudgetModal from './SetBudgetModal';
import { Plus, AlertCircle } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as Icons from 'lucide-react-native';

const BudgetScreen = () => {
  const { transactions } = useTransactionStore();
  const { budgets, loadBudgets } = useBudgetStore();
  const { categories, loadCategories } = useCategoryStore();
  const { currencySymbol } = useSettingsStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadBudgets(), loadCategories()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const budgetData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // 1. Calculate spending per category for current month
    const spending: Record<string, number> = {};
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (t.type === 'expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      }
    });

    // 2. Map categories to budget data
    // Filter only expense categories
    const expenseCategories = categories.filter(c => c.type === 'expense');

    return expenseCategories.map(cat => {
      const spent = spending[cat.name] || 0;
      const budget = budgets.find(b => b.category === cat.name);
      const limit = budget?.amount || 0;
      const progress = limit > 0 ? spent / limit : 0;
      
      let statusColor = '#4CAF50'; // Green
      if (progress >= 1) statusColor = '#F44336'; // Red
      else if (progress >= 0.8) statusColor = '#FFC107'; // Yellow

      return {
        ...cat,
        spent,
        limit,
        progress,
        statusColor,
        hasBudget: !!budget,
      };
    }).sort((a, b) => {
      // Sort by: Has Budget -> Progress Desc -> Name
      if (a.hasBudget && !b.hasBudget) return -1;
      if (!a.hasBudget && b.hasBudget) return 1;
      return b.progress - a.progress;
    });
  }, [transactions, budgets, categories]);

  const handleSetBudget = (categoryName: string, currentLimit: number) => {
    setSelectedCategory(categoryName);
    setIsModalVisible(true);
  };

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg pt-16 px-6">
      <Text className="text-light-text dark:text-dark-text text-2xl font-bold mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
        Monthly Budget
      </Text>
      <Text className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-6">
        Track your spending limits for {new Date().toLocaleDateString('en-US', { month: 'long' })}.
      </Text>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {budgetData.map((item) => {
          // @ts-ignore
          const Icon = Icons[item.icon] || Icons.HelpCircle;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSetBudget(item.name, item.limit)}
              activeOpacity={0.7}
              className="bg-light-surface dark:bg-dark-surface p-5 rounded-3xl mb-4 border border-light-border dark:border-dark-border shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: item.color + '20' }}
                  >
                    <Icon size={24} color={item.color} />
                  </View>
                  <Text className="text-light-text dark:text-dark-text font-bold text-lg">
                    {item.name}
                  </Text>
                </View>
                
                {item.hasBudget && item.progress >= 1 && (
                  <View className="flex-row items-center gap-1 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full">
                    <AlertCircle size={14} color="#F44336" />
                    <Text className="text-red-600 dark:text-red-400 text-xs font-bold">Over Budget</Text>
                  </View>
                )}
              </View>

              {item.hasBudget ? (
                <View>
                  <View className="flex-row items-baseline gap-1.5 mb-4">
                    <Text className="text-light-text dark:text-dark-text text-3xl font-bold" style={{ fontFamily: 'Outfit_700Bold' }}>
                      {currencySymbol}{item.spent.toFixed(0)}
                    </Text>
                    <Text className="text-light-text-secondary dark:text-dark-text-secondary text-xl font-medium">
                      / {currencySymbol}{item.limit.toFixed(0)}
                    </Text>
                  </View>

                  <ProgressBar progress={item.progress} color={item.statusColor} height={12} />
                  
                  <View className="flex-row justify-between mt-3">
                    <Text className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      {item.limit - item.spent >= 0 
                        ? `${currencySymbol}${(item.limit - item.spent).toFixed(0)} remaining`
                        : `${currencySymbol}${Math.abs(item.limit - item.spent).toFixed(0)} over`
                      }
                    </Text>
                    <Text className="text-sm font-bold" style={{ color: item.statusColor }}>
                      {(item.progress * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="flex-row items-center gap-3 opacity-50 py-2">
                  <View className="w-8 h-8 rounded-full bg-light-bg dark:bg-dark-bg items-center justify-center">
                    <Plus size={20} color={isDark ? '#A0A0A0' : '#6B6B6B'} />
                  </View>
                  <Text className="text-light-text-secondary dark:text-dark-text-secondary text-base font-medium">
                    Tap to set a monthly limit
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <View className="h-24" />
      </ScrollView>

      <SetBudgetModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        category={selectedCategory}
        currentLimit={budgetData.find(b => b.name === selectedCategory)?.limit}
      />
    </View>
  );
};

export default BudgetScreen;
