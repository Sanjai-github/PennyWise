import React, { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import LottieView from 'lottie-react-native';
import { Input, Button, PasswordStrength } from '../../components';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Mail, Lock, ArrowLeft, Eye, EyeOff, Check, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
  const [passwordScore, setPasswordScore] = useState(0);
  
  const { signup, isLoading } = useAuthStore();
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

  // Password strength effect
  useEffect(() => {
    let score = 0;
    if (password.length > 6) score++;
    if (password.length > 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    setPasswordScore(score);
  }, [password]);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!isValidEmail) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      await signup(name, email, password);
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Could not create account');
    }
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
          <View className="items-center mb-6">
            <View className="w-48 h-48">
              <LottieView
                source={require('../../../assets/animations/signup.json')}
                autoPlay
                loop
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            <Text 
              className="text-light-text dark:text-dark-text text-3xl font-bold mt-2"
              style={{ fontFamily: 'Outfit_700Bold' }}
            >
              Create Account
            </Text>
            <Text className="text-light-text-secondary dark:text-dark-text-secondary text-base mt-1">
              Join Penny Wise today
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4 mb-6">
            <Input
              label="Full Name"
              placeholder="e.g. John Doe"
              value={name}
              onChangeText={setName}
              leftIcon={<User size={20} color={iconColor} />}
            />
            <Input
              label="Email"
              placeholder="e.g. john@example.com"
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
            <View>
              <Input
                label="Password"
                placeholder="Create a strong password"
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
              {password.length > 0 && <PasswordStrength score={passwordScore} />}
            </View>
            <Input
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
              leftIcon={<Lock size={20} color={iconColor} />}
              rightIcon={
                isConfirmPasswordVisible 
                  ? <EyeOff size={20} color={iconColor} /> 
                  : <Eye size={20} color={iconColor} />
              }
              onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            />
          </View>

          {/* Actions */}
          <View className="gap-4">
            <Button onPress={handleSignUp} loading={isLoading} size="lg">
              Sign Up
            </Button>

            <View className="flex-row justify-center items-center gap-2 mt-2">
              <Text className="text-light-text-secondary dark:text-dark-text-secondary">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text className="text-light-primary dark:text-dark-primary font-bold">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
