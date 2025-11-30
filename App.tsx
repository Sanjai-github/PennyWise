import './global.css';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import { View, Text, AppState, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import * as LocalAuthentication from 'expo-local-authentication';
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
  const { isOnboardingCompleted, isBiometricEnabled } = useSettingsStore();
  const [currentScreen, setCurrentScreen] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [currentTab, setCurrentTab] = useState<'home' | 'history' | 'analytics' | 'budget' | 'goals' | 'settings' | 'manage-categories' | 'forgot-password'>('home');
  const [isQuickAddVisible, setIsQuickAddVisible] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Biometric Lock State
  const [isLocked, setIsLocked] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    initDatabase();
    initialize();
    loadAccounts();
  }, []);

  // Biometric Logic
  const checkBiometric = async () => {
    if (isAuthenticated && isBiometricEnabled) {
      setIsLocked(true);
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock PennyWise',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setIsLocked(false);
        }
        // If failed, remains locked
      } else {
        // Fallback if biometrics suddenly unavailable? 
        // For now, just unlock to avoid lockout, or could ask for password.
        // Given this is an "extra" security layer on top of auto-login, 
        // we'll keep it simple.
        setIsLocked(false); 
      }
    }
  };

  useEffect(() => {
    // Check on mount
    checkBiometric();

    // Check on foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkBiometric();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, isBiometricEnabled]);


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

  if (isLocked) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 bg-light-bg dark:bg-dark-bg items-center justify-center">
          <View className="items-center">
            <View className="w-20 h-20 bg-indigo-600 rounded-3xl items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
              <Text className="text-white text-4xl font-bold" style={{ fontFamily: 'Outfit_700Bold' }}>P</Text>
            </View>
            <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
              PennyWise Locked
            </Text>
            <Text className="text-light-text-secondary dark:text-dark-text-secondary mb-8">
              Authentication required
            </Text>
            
            <TouchableOpacity 
              onPress={checkBiometric}
              className="bg-indigo-600 px-8 py-3 rounded-xl"
            >
              <Text className="text-white font-bold">Unlock</Text>
            </TouchableOpacity>
          </View>
          <StatusBar style={isDark ? 'light' : 'dark'} translucent={false} />
        </View>
      </SafeAreaProvider>
    );
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
