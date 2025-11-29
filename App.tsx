import './global.css';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
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
import GoalsScreen from './src/screens/GoalsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import BottomTabs from './src/components/BottomTabs';
import QuickAddModal from './src/screens/QuickAddModal';
import { useAccountStore } from './src/store/useAccountStore';
import { useAuthStore } from './src/store/useAuthStore';
import { useSettingsStore } from './src/store/useSettingsStore';
import BudgetAlert from './src/components/BudgetAlert';

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
  const { loadAccounts } = useAccountStore();
  const { isOnboardingCompleted } = useSettingsStore();
  const [currentScreen, setCurrentScreen] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [currentTab, setCurrentTab] = useState<'home' | 'history' | 'analytics' | 'budget' | 'goals' | 'settings' | 'manage-categories' | 'forgot-password'>('home');
  const [isQuickAddVisible, setIsQuickAddVisible] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    initDatabase();
    initialize();
    loadAccounts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
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
          <StatusBar style={isDark ? 'light' : 'dark'} translucent={false} backgroundColor={isDark ? '#0F0F1A' : '#FFFFFF'} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!isOnboardingCompleted) {
    return <OnboardingScreen onFinish={() => {}} />;
  }

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-light-bg dark:bg-dark-bg">
        <View className="flex-1 pb-24">
          {currentTab === 'home' && (
            <HomeScreen 
              onNavigateToSettings={() => setCurrentTab('settings')} 
              onNavigateToGoals={() => setCurrentTab('goals')}
            />
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
          {currentTab === 'goals' && (
            <GoalsScreen />
          )}
          {currentTab === 'settings' && (
            <SettingsScreen 
              onBack={() => setCurrentTab('home')} 
              onNavigateToCategories={() => setCurrentTab('manage-categories')}
              onNavigateToForgotPassword={() => setCurrentTab('forgot-password')}
            />
          )}
          {currentTab === 'manage-categories' && (
            <ManageCategoriesScreen onBack={() => setCurrentTab('settings')} />
          )}
          {currentTab === 'forgot-password' && (
            <ForgotPasswordScreen onNavigateToLogin={() => setCurrentTab('settings')} />
          )}
        </View>
        
        {currentTab !== 'manage-categories' && currentTab !== 'forgot-password' && (
          <BottomTabs 
            currentTab={currentTab as any} 
            onTabChange={(tab) => setCurrentTab(tab)}
            onAddPress={() => setIsQuickAddVisible(true)}
          />
        )}

        <QuickAddModal
          visible={isQuickAddVisible}
          onClose={() => setIsQuickAddVisible(false)}
          initialType="expense"
        />
        <BudgetAlert />
        <StatusBar style={isDark ? 'light' : 'dark'} translucent={false} />
      </View>
    </SafeAreaProvider>
  );
}
