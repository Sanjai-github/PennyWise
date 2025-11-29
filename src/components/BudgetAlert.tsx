import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';
import { useBudgetAlertStore } from '../store/useBudgetAlertStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useColorScheme } from 'nativewind';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const BudgetAlert = () => {
  const { visible, data, hideAlert } = useBudgetAlertStore();
  const { currencySymbol } = useSettingsStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Animate In
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          stiffness: 100,
        })
      ]).start();

      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        hide();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (visible) hideAlert();
    });
  };

  if (!data) return null;

  const remainingAfter = data.remainingBefore - data.transactionAmount;
  const isOverBudget = remainingAfter < 0;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View 
        style={[
          styles.container, 
          { 
            opacity,
            transform: [{ scale }] 
          }
        ]}
      >
        <View 
          className="w-full p-6 rounded-3xl border border-light-border dark:border-dark-border bg-white dark:bg-neutral-900 shadow-xl"
          style={styles.shadow}
        >
          <View className="flex-row items-center gap-4">
            <View className={`w-12 h-12 rounded-full items-center justify-center ${isOverBudget ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
              {isOverBudget ? (
                <AlertCircle size={24} color={isOverBudget ? '#F44336' : '#4CAF50'} />
              ) : (
                <CheckCircle2 size={24} color={isOverBudget ? '#F44336' : '#4CAF50'} />
              )}
            </View>
            
            <View className="flex-1">
              <Text className="text-light-text dark:text-dark-text font-bold text-lg mb-1">
                {data.category} Budget
              </Text>
              <View className="flex-row items-center gap-1 flex-wrap">
                <Text className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                  {currencySymbol}{data.remainingBefore.toFixed(0)} - {currencySymbol}{data.transactionAmount.toFixed(0)} = 
                </Text>
                <Text className={`font-bold text-base ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                  {currencySymbol}{remainingAfter.toFixed(0)} left
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  container: {
    width: width - 64,
    maxWidth: 400,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  }
});

export default BudgetAlert;
