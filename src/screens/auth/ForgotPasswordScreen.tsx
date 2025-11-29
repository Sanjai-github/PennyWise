import React, { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import LottieView from 'lottie-react-native';
import { Input, Button, PasswordStrength } from '../../components';
import { Mail, ArrowLeft, Lock, Eye, EyeOff, KeyRound } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../../store/useAuthStore';

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
}

type Step = 'email' | 'otp' | 'password';

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigateToLogin }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  
  const { sendOtp, verifyOtp, resetPassword, isLoading } = useAuthStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#A0A0A0' : '#6B6B6B';

  // Password strength effect
  useEffect(() => {
    let score = 0;
    if (newPassword.length > 6) score++;
    if (newPassword.length > 10) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    setPasswordScore(score);
  }, [newPassword]);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    try {
      await sendOtp(email);
      setStep('otp');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) {
      Alert.alert('Error', 'Please enter a valid 4-digit OTP');
      return;
    }
    try {
      const isValid = await verifyOtp(email, otp);
      if (isValid) {
        setStep('password');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      await resetPassword(email, newPassword);
      Alert.alert('Success', 'Password reset successfully', [
        { text: 'Login', onPress: onNavigateToLogin }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset password');
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'email':
        return (
          <View className="gap-4">
            <Text className="text-light-text-secondary dark:text-dark-text-secondary text-base text-center mb-4">
              Enter your email address to receive a 4-digit verification code.
            </Text>
            <Input
              label="Email"
              placeholder="e.g. john.doe@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={iconColor} />}
            />
            <Button onPress={handleSendOtp} loading={isLoading} size="lg" className="mt-4">
              Send OTP
            </Button>
          </View>
        );

      case 'otp':
        return (
          <View className="gap-4">
            <Text className="text-light-text-secondary dark:text-dark-text-secondary text-base text-center mb-4">
              Enter the 4-digit code sent to {email}
            </Text>
            <Input
              label="OTP Code"
              placeholder="0000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={4}
              className="text-center text-2xl tracking-widest font-bold"
              leftIcon={<KeyRound size={20} color={iconColor} />}
            />
            <Button onPress={handleVerifyOtp} loading={isLoading} size="lg" className="mt-4">
              Verify Code
            </Button>
            <TouchableOpacity onPress={() => setStep('email')} className="self-center mt-4">
              <Text className="text-light-primary dark:text-dark-primary font-medium">
                Change Email
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'password':
        return (
          <View className="gap-4">
            <Text className="text-light-text-secondary dark:text-dark-text-secondary text-base text-center mb-4">
              Create a new strong password for your account.
            </Text>
            <View>
              <Input
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!isPasswordVisible}
                leftIcon={<Lock size={20} color={iconColor} />}
                rightIcon={
                  isPasswordVisible 
                    ? <EyeOff size={20} color={iconColor} /> 
                    : <Eye size={20} color={iconColor} />
                }
                onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
              />
              {newPassword.length > 0 && <PasswordStrength score={passwordScore} />}
            </View>
            <Input
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isPasswordVisible}
              leftIcon={<Lock size={20} color={iconColor} />}
            />
            <Button onPress={handleResetPassword} loading={isLoading} size="lg" className="mt-4">
              Reset Password
            </Button>
          </View>
        );
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
          <View className="items-center mb-8">
            <View className="w-64 h-64">
              <LottieView
                source={require('../../../assets/animations/Forgot Password.json')}
                autoPlay
                loop
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            <Text 
              className="text-light-text dark:text-dark-text text-3xl font-bold mt-4"
              style={{ fontFamily: 'Outfit_700Bold' }}
            >
              {step === 'email' ? 'Forgot Password?' : step === 'otp' ? 'Verify OTP' : 'Reset Password'}
            </Text>
          </View>

          {/* Form Content */}
          {renderStepContent()}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
