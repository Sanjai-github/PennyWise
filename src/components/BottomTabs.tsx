import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Home, PieChart, Settings, Clock, Wallet } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface BottomTabsProps {
  currentTab: 'home' | 'history' | 'analytics' | 'budget' | 'settings';
  onTabChange: (tab: 'home' | 'history' | 'analytics' | 'budget' | 'settings') => void;
}

const BottomTabs: React.FC<BottomTabsProps> = ({ currentTab, onTabChange }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'analytics', icon: PieChart, label: 'Analytics' },
    { id: 'budget', icon: Wallet, label: 'Budget' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border pb-8 pt-2 px-4 flex-row justify-between items-center">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className="items-center justify-center p-2 flex-1"
          >
            <Icon 
              size={24} 
              color={isActive 
                ? (isDark ? '#818CF8' : '#4F46E5') 
                : (isDark ? '#6B7280' : '#9CA3AF')
              } 
            />
            <Text 
              className={`text-[10px] mt-1 font-medium ${
                isActive 
                  ? 'text-light-primary dark:text-dark-primary' 
                  : 'text-light-text-secondary dark:text-dark-text-secondary'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomTabs;
