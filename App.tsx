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
      <HomeScreen />
      <StatusBar style="auto" />
    </View>
  );
}
