import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useAccountStore } from '../store/useAccountStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { Button } from '../components';
import { Wallet, TrendingUp, TrendingDown, User, Coffee, ShoppingBag, Home, Car, DollarSign, ArrowUpRight, ArrowDownLeft, Target } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import GlassView from '../components/GlassView';
import { LineChart } from 'react-native-gifted-charts';
import TransactionItem from '../components/TransactionItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeScreenProps {
  onNavigateToSettings: () => void;
  onNavigateToGoals: () => void;
}

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToSettings, onNavigateToGoals }) => {
  const { accounts, loadAccounts, recalculateBalance, isLoading: accountsLoading } = useAccountStore();
  const { transactions, loadTransactions, isLoading: transactionsLoading } = useTransactionStore();
  const { categories, loadCategories } = useCategoryStore();
  const { currencySymbol } = useSettingsStore();
  const { user } = useAuthStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadAccounts();
    loadTransactions();
    loadCategories();
    recalculateBalance();
  }, []);

  const onRefresh = React.useCallback(() => {
    loadAccounts();
    loadTransactions();
    loadCategories();
    recalculateBalance();
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [accounts]);

  const { totalIncome, totalExpense } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.reduce(
      (acc, tx) => {
        const txDate = new Date(tx.date);
        if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
          if (tx.type === 'income') {
            acc.totalIncome += tx.amount;
          } else {
            acc.totalExpense += tx.amount;
          }
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 6); // Show 6 items for grid
  }, [transactions]);

  const textColor = isDark ? '#FFFFFF' : '#2C2C2C';
  const secondaryTextColor = isDark ? 'rgba(255,255,255,0.6)' : '#6B6B6B';



  const getCategoryIcon = (category: string, color: string) => {
    const size = 24;
    switch (category.toLowerCase()) {
      case 'food': return <Coffee size={size} color={color} />;
      case 'shopping': return <ShoppingBag size={size} color={color} />;
      case 'housing': return <Home size={size} color={color} />;
      case 'transport': return <Car size={size} color={color} />;
      default: return <DollarSign size={size} color={color} />;
    }
  };

  // Calculate Intra-day (Today's) balance trend
  const chartData = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get today's transactions sorted by time (earliest first)
    const todaysTransactions = transactions
      .filter(tx => new Date(tx.date) >= startOfToday)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate opening balance for today
    // Start with current total and reverse today's transactions
    let openingBalance = totalBalance;
    // We iterate backwards through time (latest to earliest) to reverse
    for (let i = todaysTransactions.length - 1; i >= 0; i--) {
      const tx = todaysTransactions[i];
      if (tx.type === 'income') {
        openingBalance -= tx.amount;
      } else {
        openingBalance += tx.amount;
      }
    }

    // Build chart points
    const points = [{ value: openingBalance }]; // Start of day
    let current = openingBalance;

    todaysTransactions.forEach(tx => {
      if (tx.type === 'income') {
        current += tx.amount;
      } else {
        current -= tx.amount;
      }
      points.push({ value: current });
    });

    // Add current moment point to extend the line to the right
    points.push({ value: totalBalance });

    // Ensure we have at least 2 points for a line
    if (points.length === 1) {
      points.push({ value: totalBalance });
    }

    return points;
  }, [transactions, totalBalance]);

  const chartWidth = width - 80;
  // Dynamic spacing based on number of points
  // If only 2 points (start and end), spacing is the full width
  const spacing = chartData.length > 1 ? chartWidth / (chartData.length - 1) : chartWidth;

  const Background = () => {
    if (isDark) {
      return (
        <LinearGradient
          colors={['#0F0F1A', '#1A1A2E', '#2E1A2E']}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      );
    }
    return <View className="absolute w-full h-full bg-light-bg" />;
  };

  return (
    <>
      <Background />
      <View className="flex-1 p-6" style={{ paddingTop: insets.top + 20 }}>
        {/* Fixed Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-light-text-secondary dark:text-dark-text-secondary text-lg font-medium">
              {greeting},
            </Text>
            <Text
              className="text-light-text dark:text-dark-text text-3xl font-bold"
              style={{ fontFamily: 'Outfit_700Bold' }}
            >
              {user?.name || 'Penny Wise'}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={onNavigateToGoals}
              className="w-12 h-12 rounded-full bg-light-surface dark:bg-white/10 items-center justify-center border border-light-border dark:border-white/10"
            >
              <Target size={24} color={textColor} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onNavigateToSettings}
              className="w-12 h-12 rounded-full bg-light-surface dark:bg-white/10 items-center justify-center border border-light-border dark:border-white/10 overflow-hidden"
            >
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} className="w-full h-full" />
              ) : (
                <User size={24} color={textColor} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={accountsLoading || transactionsLoading} 
              onRefresh={onRefresh}
              tintColor={isDark ? '#FFF' : '#000'}
            />
          }
        >
          <View className="gap-6">

          {/* Balance Card with Wave Chart */}
          <GlassView 
            className="rounded-[32px] p-6 overflow-hidden border border-white/10"
            gradientColors={isDark ? ['rgba(139, 92, 246, 0.4)', 'rgba(59, 130, 246, 0.2)'] : undefined}
            intensity={60}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-light-text/70 dark:text-white/70 text-base font-medium">
                Balance
              </Text>
              <Text className="text-light-text/50 dark:text-white/30 text-xs">
                {currencySymbol}{totalBalance.toFixed(2)}
              </Text>
            </View>
            
            <Text
              className="text-light-text dark:text-white text-4xl font-bold mb-4"
              style={{ fontFamily: 'Outfit_700Bold' }}
            >
              {currencySymbol}{totalBalance.toFixed(2)}
            </Text>

            <View className="-ml-4 -mr-4 -mb-6 h-32">
              <LineChart
                data={chartData}
                curved
                thickness={3}
                color={isDark ? '#A78BFA' : '#8B5CF6'}
                hideDataPoints
                hideRules
                hideAxesAndRules
                hideYAxisText
                xAxisLabelTextStyle={{ color: 'transparent' }}
                height={100}
                width={chartWidth}
                initialSpacing={0}
                spacing={spacing}
                maxValue={Math.max(...chartData.map(d => d.value), 100)} // Ensure non-zero max
                startFillColor={isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.3)'}
                endFillColor={isDark ? 'rgba(167, 139, 250, 0.01)' : 'rgba(139, 92, 246, 0.01)'}
                startOpacity={0.9}
                endOpacity={0.1}
                areaChart
              />
            </View>
          </GlassView>

          {/* Income & Expense Cards (Neon Glow) */}
          <View className="flex-row gap-4">
            <GlassView 
              className="flex-1 rounded-2xl p-4 border border-green-500/30"
              gradientColors={isDark ? ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)'] : undefined}
              intensity={30}
              style={isDark ? { shadowColor: '#10B981', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10 } : {}}
            >
              <Text className="text-light-text/70 dark:text-white/60 text-xs mb-1 text-center">Income</Text>
              <View className="flex-row items-center justify-center gap-1">
                <ArrowUpRight size={16} color="#10B981" />
                <Text className="text-light-text dark:text-white font-bold text-lg">
                  {currencySymbol}{totalIncome.toFixed(2)}
                </Text>
              </View>
            </GlassView>

            <GlassView 
              className="flex-1 rounded-2xl p-4 border border-red-500/30"
              gradientColors={isDark ? ['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)'] : undefined}
              intensity={30}
              style={isDark ? { shadowColor: '#EF4444', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10 } : {}}
            >
              <Text className="text-light-text/70 dark:text-white/60 text-xs mb-1 text-center">Expense</Text>
              <View className="flex-row items-center justify-center gap-1">
                <ArrowDownLeft size={16} color="#EF4444" />
                <Text className="text-light-text dark:text-white font-bold text-lg">
                  {currencySymbol}{totalExpense.toFixed(2)}
                </Text>
              </View>
            </GlassView>
          </View>

          {/* Recent Transactions (Grid Style) */}
          <View>
            <Text
              className="text-light-text dark:text-dark-text text-xl font-bold mb-4"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              Recent Transactions
            </Text>
            <Text className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-medium mb-4">
              Today
            </Text>

            <View className="flex-row flex-wrap gap-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const color = isIncome ? '#10B981' : '#F43F5E';
                  const category = categories.find(c => c.name === tx.category);
                  const iconName = category?.icon || (isIncome ? 'DollarSign' : 'ShoppingBag');
                  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.DollarSign;
                  
                  return (
                    <GlassView 
                      key={tx.id}
                      className="w-[30%] rounded-2xl items-center justify-center p-3 border border-white/5"
                      intensity={20}
                      gradientColors={isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : undefined}
                    >
                      <View 
                        className="w-10 h-10 rounded-full items-center justify-center mb-2"
                        style={{ backgroundColor: `${color}20`, shadowColor: color, shadowOpacity: 0.5, shadowRadius: 8 }}
                      >
                        <IconComponent size={18} color={color} />
                      </View>
                      <Text className="text-light-text dark:text-white font-semibold text-xs text-center" numberOfLines={1}>
                        {tx.category}
                      </Text>
                      {tx.note && (
                        <Text className="text-light-text-secondary dark:text-dark-text-secondary text-[9px] text-center mt-0.5" numberOfLines={1}>
                          {tx.note}
                        </Text>
                      )}
                      <Text className={`font-bold text-sm mt-1 ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                        {currencySymbol}{tx.amount.toFixed(0)}
                      </Text>
                    </GlassView>
                  );
                })
              ) : (
                <View className="w-full py-8 items-center justify-center">
                  <Wallet size={48} color={secondaryTextColor} />
                  <Text className="text-light-text-secondary dark:text-dark-text-secondary mt-2 text-center">
                    No transactions yet.
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="h-24" />
        </View>
      </ScrollView>

      </View>
    </>
  );
};

export default HomeScreen;
