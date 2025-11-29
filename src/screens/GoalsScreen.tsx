import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useGoalStore } from '../store/useGoalStore';
import { useSettingsStore } from '../store/useSettingsStore';
import ProgressBar from '../components/ProgressBar';
import AddGoalModal from './AddGoalModal';
import AllocateFundsModal from './AllocateFundsModal';
import { Plus, Wallet, Target, ArrowRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as Icons from 'lucide-react-native';

const GoalsScreen = () => {
  const { goals, walletBalance, loadGoals, loadWallet, allocateToGoal, deleteGoal } = useGoalStore();
  const { currencySymbol } = useSettingsStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedGoal, setSelectedGoal] = useState<{id: number, name: string} | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadGoals(), loadWallet()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAllocatePress = (goalId: number, goalName: string) => {
    if (walletBalance <= 0) {
      Alert.alert('Empty Wallet', 'You have no funds in your Goals Wallet to allocate.');
      return;
    }
    setSelectedGoal({ id: goalId, name: goalName });
  };

  const handleAllocateSubmit = (amount: number) => {
    if (selectedGoal) {
      allocateToGoal(selectedGoal.id, amount);
      setSelectedGoal(null);
    }
  };

  const handleLongPress = (goalId: number) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? Any allocated funds will be returned to your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteGoal(goalId) 
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg pt-16 px-6">
      <Text className="text-light-text dark:text-dark-text text-2xl font-bold mb-6" style={{ fontFamily: 'Outfit_700Bold' }}>
        Goals
      </Text>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Wallet Card */}
        <View className="bg-indigo-600 rounded-3xl p-6 mb-8 shadow-lg shadow-indigo-200 dark:shadow-none">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                <Wallet size={16} color="white" />
              </View>
              <Text className="text-white/80 font-medium">Goals Wallet</Text>
            </View>
          </View>
          
          <Text className="text-white text-4xl font-bold mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
            {currencySymbol}{walletBalance.toFixed(2)}
          </Text>
          <Text className="text-white/60 text-sm">
            Unused budget from previous months
          </Text>
        </View>

        {/* Goals List */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-light-text dark:text-dark-text font-bold text-lg">Your Goals</Text>
          <TouchableOpacity 
            onPress={() => setIsModalVisible(true)}
            className="flex-row items-center gap-1 bg-light-surface dark:bg-dark-surface px-3 py-1.5 rounded-full border border-light-border dark:border-dark-border"
          >
            <Plus size={14} color={isDark ? '#E8E8E8' : '#2C2C2C'} />
            <Text className="text-light-text dark:text-dark-text text-xs font-bold">New Goal</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View className="items-center justify-center py-10 opacity-50">
            <Target size={48} color={isDark ? '#A0A0A0' : '#6B6B6B'} />
            <Text className="text-light-text-secondary dark:text-dark-text-secondary mt-4 text-center">
              No goals yet. Create one to start saving!
            </Text>
          </View>
        ) : (
          goals.map((goal) => {
            // @ts-ignore
            const Icon = Icons[goal.icon] || Icons.Target;
            const progress = goal.currentAmount / goal.targetAmount;

            return (
              <TouchableOpacity
                key={goal.id}
                onLongPress={() => handleLongPress(goal.id)}
                onPress={() => handleAllocatePress(goal.id, goal.name)}
                activeOpacity={0.7}
                className="bg-light-surface dark:bg-dark-surface p-5 rounded-3xl mb-4 border border-light-border dark:border-dark-border"
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-3">
                    <View 
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: goal.color + '20' }}
                    >
                      <Icon size={24} color={goal.color} />
                    </View>
                    <View>
                      <Text className="text-light-text dark:text-dark-text font-bold text-lg">
                        {goal.name}
                      </Text>
                      <Text className="text-light-text-secondary dark:text-dark-text-secondary text-xs">
                        Target: {currencySymbol}{goal.targetAmount.toFixed(0)}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-light-bg dark:bg-dark-bg px-3 py-1 rounded-full">
                    <Text className="text-light-text dark:text-dark-text font-bold text-xs">
                      {(progress * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>

                <View className="mb-2">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-light-text dark:text-dark-text font-bold text-xl">
                      {currencySymbol}{goal.currentAmount.toFixed(0)}
                    </Text>
                    <Text className="text-light-text-secondary dark:text-dark-text-secondary text-sm self-end mb-1">
                      {currencySymbol}{(goal.targetAmount - goal.currentAmount).toFixed(0)} to go
                    </Text>
                  </View>
                  <ProgressBar progress={progress} color={goal.color} height={10} />
                </View>
                
                {walletBalance > 0 && (
                  <View className="flex-row items-center justify-end gap-1 mt-2 opacity-80">
                    <Text className="text-xs text-indigo-500 font-medium">Tap to fund</Text>
                    <ArrowRight size={12} color="#6366F1" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
        <View className="h-24" />
      </ScrollView>

      <AddGoalModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />

      <AllocateFundsModal
        visible={!!selectedGoal}
        onClose={() => setSelectedGoal(null)}
        onAllocate={handleAllocateSubmit}
        walletBalance={walletBalance}
        goalName={selectedGoal?.name || ''}
      />
    </View>
  );
};

export default GoalsScreen;
