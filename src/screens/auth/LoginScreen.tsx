import React, { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import LottieView from 'lottie-react-native';
import { Input, Button } from '../../components';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, Eye, EyeOff, Check, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface LoginScreenProps {
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToSignUp, onNavigateToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
  
  const { login, isLoading } = useAuthStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#A0A0A0' : '#6B6B6B';

  // Email validation effect
  useEffect(() => {
    if (email.length === 0) {
      setIsValidEmail(null);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email));
  }, [email]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!isValidEmail) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-light-bg dark:bg-dark-bg"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 justify-center">
          {/* Header Animation */}
          <View className="items-center mb-8">
            <View className="w-64 h-64">
              <LottieView
                source={require('../../../assets/animations/login.json')}
                autoPlay
                loop
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            <Text 
              className="text-light-text dark:text-dark-text text-3xl font-bold mt-4"
              style={{ fontFamily: 'Outfit_700Bold' }}
            >
              Welcome Back
            </Text>
            <Text className="text-light-text-secondary dark:text-dark-text-secondary text-base mt-2">
              Sign in to continue managing your finances
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4 mb-6">
            <Input
              label="Email"
              placeholder="e.g. john.doe@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={iconColor} />}
              rightIcon={
                isValidEmail === true ? <Check size={20} color="#4CAF50" /> :
                isValidEmail === false ? <X size={20} color="#F44336" /> : null
              }
              error={isValidEmail === false ? 'Invalid email address' : undefined}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              leftIcon={<Lock size={20} color={iconColor} />}
              rightIcon={
                isPasswordVisible 
                  ? <EyeOff size={20} color={iconColor} /> 
                  : <Eye size={20} color={iconColor} />
              }
              onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
            />
            
            <TouchableOpacity onPress={onNavigateToForgotPassword} className="self-end">
              <Text className="text-light-primary dark:text-dark-primary font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View className="gap-4">
            <Button onPress={handleLogin} loading={isLoading} size="lg">
              Sign In
            </Button>

            <View className="flex-row justify-center items-center gap-2 mt-4">
              <Text className="text-light-text-secondary dark:text-dark-text-secondary">
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={onNavigateToSignUp}>
                <Text className="text-light-primary dark:text-dark-primary font-bold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
