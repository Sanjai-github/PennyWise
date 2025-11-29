import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useAccountStore } from '../store/useAccountStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { Card, Button } from '../components';
import TransactionItem from '../components/TransactionItem';
import QuickAddModal from './QuickAddModal';
import { Plus, Minus, Wallet, TrendingUp, TrendingDown, Settings, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface HomeScreenProps {
  onNavigateToSettings: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToSettings }) => {
  const { accounts, loadAccounts, recalculateBalance, isLoading: accountsLoading } = useAccountStore();
  const { transactions, loadTransactions, isLoading: transactionsLoading } = useTransactionStore();
  const { currencySymbol } = useSettingsStore();
  const { user } = useAuthStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    loadAccounts();
    loadTransactions();
    recalculateBalance(); // Ensure balance is in sync
  }, []);

  const onRefresh = React.useCallback(() => {
    loadAccounts();
    loadTransactions();
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
    return transactions.slice(0, 5);
  }, [transactions]);

  const textColor = isDark ? '#E8E8E8' : '#2C2C2C';
  const secondaryTextColor = isDark ? '#A0A0A0' : '#6B6B6B';

  const handleOpenModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setIsModalVisible(true);
  };

  return (
    <>
      <ScrollView
        className="flex-1 bg-light-bg dark:bg-dark-bg"
        refreshControl={
          <RefreshControl refreshing={accountsLoading || transactionsLoading} onRefresh={onRefresh} />
        }
      >
        <View className="p-6 pt-16 gap-6">
          {/* Header */}
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-medium">
                {greeting},
              </Text>
              <Text
                className="text-light-text dark:text-dark-text text-2xl font-bold"
                style={{ fontFamily: 'Outfit_700Bold' }}
              >
                {user?.name || 'Penny Wise'}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onNavigateToSettings}
              className="w-12 h-12 rounded-full bg-light-surface dark:bg-dark-surface items-center justify-center border border-light-border dark:border-dark-border overflow-hidden"
            >
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} className="w-full h-full" />
              ) : (
                <User size={24} color={textColor} />
              )}
            </TouchableOpacity>
          </View>

          {/* Balance Card */}
          <View className="bg-light-primary dark:bg-dark-primary rounded-3xl p-6 shadow-lg">
            <Text className="text-light-text/70 dark:text-dark-text/70 text-sm font-medium mb-1">
              Total Balance
            </Text>
            <Text
              className="text-light-text dark:text-dark-text text-4xl font-bold mb-6"
              style={{ fontFamily: 'Outfit_700Bold' }}
            >
              {currencySymbol}{totalBalance.toFixed(2)}
            </Text>

            <View className="flex-row gap-4">
              <View className="flex-1 bg-white/20 rounded-xl p-3 flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-white/30 items-center justify-center">
                  <TrendingUp size={16} color={isDark ? '#FFF' : '#2C2C2C'} />
                </View>
                <View>
                  <Text className="text-light-text/70 dark:text-dark-text/70 text-xs">Income</Text>
                  <Text className="text-light-text dark:text-dark-text font-bold text-sm">{currencySymbol}{totalIncome.toFixed(2)}</Text>
                </View>
              </View>
              <View className="flex-1 bg-white/20 rounded-xl p-3 flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-white/30 items-center justify-center">
                  <TrendingDown size={16} color={isDark ? '#FFF' : '#2C2C2C'} />
                </View>
                <View>
                  <Text className="text-light-text/70 dark:text-dark-text/70 text-xs">Expense</Text>
                  <Text className="text-light-text dark:text-dark-text font-bold text-sm">{currencySymbol}{totalExpense.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Button onPress={() => handleOpenModal('income')} variant="primary" size="lg">
                <View className="flex-row items-center gap-2">
                  <Plus size={20} color={isDark ? '#FFF' : '#2C2C2C'} />
                  <Text className="font-semibold">Income</Text>
                </View>
              </Button>
            </View>
            <View className="flex-1">
              <Button onPress={() => handleOpenModal('expense')} variant="secondary" size="lg">
                <View className="flex-row items-center gap-2">
                  <Minus size={20} color={isDark ? '#FFF' : '#2C2C2C'} />
                  <Text className="font-semibold">Expense</Text>
                </View>
              </Button>
            </View>
          </View>

          {/* Recent Transactions */}
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-light-text dark:text-dark-text text-xl font-bold"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Recent Transactions
              </Text>
              <Text className="text-light-primary dark:text-dark-primary font-medium">
                See All
              </Text>
            </View>

            <Card>
              {recentTransactions.length > 0 ? (
                <View>
                  {recentTransactions.map((tx) => (
                    <TransactionItem key={tx.id} transaction={tx} />
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center justify-center">
                  <Wallet size={48} color={secondaryTextColor} />
                  <Text className="text-light-text-secondary dark:text-dark-text-secondary mt-2 text-center">
                    No transactions yet.&#10;Add your first one!
                  </Text>
                </View>
              )}
            </Card>
          </View>

          <View className="h-8" />
        </View>
      </ScrollView>

      <QuickAddModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        initialType={modalType}
      />
    </>
  );
};

export default HomeScreen;
