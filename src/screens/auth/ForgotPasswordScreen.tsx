import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import LottieView from 'lottie-react-native';
import { Input, Button } from '../../components';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success', 
        'If an account exists with this email, you will receive a password reset link shortly.',
        [{ text: 'OK', onPress: onNavigateToLogin }]
      );
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-light-bg dark:bg-dark-bg"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 justify-center">
          <TouchableOpacity onPress={onNavigateToLogin} className="mb-4">
            <ArrowLeft size={24} color={isDark ? '#E8E8E8' : '#2C2C2C'} />
          </TouchableOpacity>

          {/* Header Animation */}
          <View className="items-center mb-8">
            <View className="w-64 h-64">
              <LottieView
                source={require('../../../assets/animations/forget-password.json')}
                autoPlay
                loop
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            <Text 
              className="text-light-text dark:text-dark-text text-3xl font-bold mt-4"
              style={{ fontFamily: 'Outfit_700Bold' }}
            >
              Forgot Password?
            </Text>
            <Text className="text-light-text-secondary dark:text-dark-text-secondary text-base mt-2 text-center">
              Don't worry! It happens. Please enter the email associated with your account.
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
              leftIcon={<Mail size={20} color={isDark ? '#A0A0A0' : '#6B6B6B'} />}
            />
          </View>

          {/* Actions */}
          <View className="gap-4">
            <Button onPress={handleReset} loading={isLoading} size="lg">
              Send Reset Link
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
