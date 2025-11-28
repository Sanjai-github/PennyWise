import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useEffect, useState } from 'react';
import { initDatabase } from './src/db/init';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ManageCategoriesScreen from './src/screens/ManageCategoriesScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import BottomTabs from './src/components/BottomTabs';
import { useAuthStore } from './src/store/useAuthStore';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const { isAuthenticated, initialize } = useAuthStore();
  const [currentScreen, setCurrentScreen] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [currentTab, setCurrentTab] = useState<'home' | 'history' | 'analytics' | 'budget' | 'settings' | 'manage-categories'>('home');

  useEffect(() => {
    initDatabase();
    initialize();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-light-bg dark:bg-dark-bg">
        {currentScreen === 'login' && (
          <LoginScreen 
            onNavigateToSignUp={() => setCurrentScreen('signup')} 
            onNavigateToForgotPassword={() => setCurrentScreen('forgot-password')}
          />
        )}
        {currentScreen === 'signup' && (
          <SignUpScreen onNavigateToLogin={() => setCurrentScreen('login')} />
        )}
        {currentScreen === 'forgot-password' && (
          <ForgotPasswordScreen onNavigateToLogin={() => setCurrentScreen('login')} />
        )}
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg">
      <View className="flex-1 pb-24">
        {currentTab === 'home' && (
          <HomeScreen onNavigateToSettings={() => setCurrentTab('settings')} />
        )}
        {currentTab === 'history' && (
          <HistoryScreen />
        )}
        {currentTab === 'analytics' && (
          <AnalyticsScreen />
        )}
        {currentTab === 'budget' && (
          <BudgetScreen />
        )}
        {currentTab === 'settings' && (
          <SettingsScreen 
            onBack={() => setCurrentTab('home')} 
            onNavigateToCategories={() => setCurrentTab('manage-categories')}
          />
        )}
        {currentTab === 'manage-categories' && (
          <ManageCategoriesScreen onBack={() => setCurrentTab('settings')} />
        )}
      </View>
      
      {currentTab !== 'manage-categories' && (
        <BottomTabs 
          currentTab={currentTab as any} 
          onTabChange={(tab) => setCurrentTab(tab)} 
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
}
