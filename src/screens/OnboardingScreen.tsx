import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, TextInput, Image, Alert } from 'react-native';
import LottieView from 'lottie-react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useAccountStore } from '../store/useAccountStore';
import { ArrowRight, Check, DollarSign, Camera, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Button } from '../components';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const { setCurrency, completeOnboarding, currency } = useSettingsStore();
  const { updateProfileImage } = useAuthStore();
  const { setBudget } = useBudgetStore();
  const [budgetAmount, setBudgetAmount] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      await updateProfileImage(result.assets[0].uri);
    }
  };

  const handleFinish = async () => {
    if (budgetAmount) {
      const amount = parseFloat(budgetAmount);
      // For now, we set a general budget. In a real app, this might be per category.
      // Since the schema requires a category, we'll use 'General' or 'Monthly'.
      await setBudget({
        category: 'Monthly',
        amount,
      });
    }

    // Create default account if none exists
    const { accounts, addAccount } = useAccountStore.getState();
    if (accounts.length === 0) {
      await addAccount({
        name: 'Cash',
        type: 'cash',
        balance: 0,
        currency: currency,
      });
    }

    completeOnboarding();
    onFinish();
  };

  const renderStep0 = () => (
    <View className="flex-1 items-center justify-center p-6">
      <View className="w-72 h-72 mb-8">
        <LottieView
          source={require('../../assets/animations/Welcome.json')}
          autoPlay
          loop
          style={{ width: '100%', height: '100%' }}
        />
      </View>
      <Text className="text-3xl font-bold text-light-text dark:text-dark-text text-center mb-4" style={{ fontFamily: 'Outfit_700Bold' }}>
        Welcome to Penny Wise
      </Text>
      <Text className="text-lg text-light-text-secondary dark:text-dark-text-secondary text-center mb-12">
        Take control of your finances with smart tracking and budgeting.
      </Text>
      <Button onPress={handleNext} size="lg" className="w-full">
        Get Started
      </Button>
    </View>
  );

  const renderStep1 = () => (
    <View className="flex-1 p-6 pt-12">
      <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
        Profile Picture
      </Text>
      <Text className="text-light-text-secondary dark:text-dark-text-secondary mb-8">
        Add a photo to personalize your experience.
      </Text>

      <View className="flex-1 items-center justify-center">
        <TouchableOpacity onPress={pickImage} className="relative">
          <View className="w-40 h-40 rounded-full bg-light-surface dark:bg-dark-surface border-4 border-light-border dark:border-dark-border items-center justify-center overflow-hidden">
            {profileImage ? (
              <Image source={{ uri: profileImage }} className="w-full h-full" />
            ) : (
              <User size={64} color={isDark ? '#555' : '#CCC'} />
            )}
          </View>
          <View className="absolute bottom-0 right-0 bg-light-primary dark:bg-dark-primary p-3 rounded-full border-4 border-light-bg dark:border-dark-bg">
            <Camera size={20} color="white" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleNext} className="mt-8">
          <Text className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>

      <Button onPress={handleNext} size="lg" className="mt-4">
        {profileImage ? 'Next' : 'Skip'}
      </Button>
    </View>
  );

  const renderStep2 = () => (
    <View className="flex-1 p-6 pt-12">
      <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
        Select Currency
      </Text>
      <Text className="text-light-text-secondary dark:text-dark-text-secondary mb-8">
        Choose the currency for your transactions.
      </Text>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {currencies.map((c) => (
            <TouchableOpacity
              key={c.code}
              onPress={() => setCurrency(c.code)}
              className={`flex-row items-center justify-between p-4 rounded-xl border ${
                currency === c.code
                  ? 'bg-light-primary/10 dark:bg-dark-primary/20 border-light-primary dark:border-dark-primary'
                  : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border'
              }`}
            >
              <View className="flex-row items-center gap-4">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                  currency === c.code ? 'bg-light-primary dark:bg-dark-primary' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Text className={`text-lg font-bold ${
                    currency === c.code ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {c.symbol}
                  </Text>
                </View>
                <View>
                  <Text className="text-lg font-bold text-light-text dark:text-dark-text">
                    {c.code}
                  </Text>
                  <Text className="text-light-text-secondary dark:text-dark-text-secondary">
                    {c.name}
                  </Text>
                </View>
              </View>
              {currency === c.code && (
                <View className="bg-light-primary dark:bg-dark-primary rounded-full p-1">
                  <Check size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Button onPress={handleNext} size="lg" className="mt-4">
        Next
      </Button>
    </View>
  );

  const renderStep3 = () => (
    <View className="flex-1 p-6 pt-12">
      <Text className="text-2xl font-bold text-light-text dark:text-dark-text mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
        Set Monthly Goal
      </Text>
      <Text className="text-light-text-secondary dark:text-dark-text-secondary mb-8">
        How much do you want to spend this month? (Optional)
      </Text>

      <View className="flex-1 justify-center">
        <View className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border items-center">
          <View className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 items-center justify-center mb-4">
            <DollarSign size={32} color="#4CAF50" />
          </View>
          <Text className="text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Monthly Budget
          </Text>
          <View className="flex-row items-center justify-center w-full">
            <Text className="text-3xl font-bold text-light-text dark:text-dark-text mr-2">
              {currencies.find(c => c.code === currency)?.symbol}
            </Text>
            <TextInput
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              placeholder="0"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              keyboardType="numeric"
              className="text-4xl font-bold text-light-text dark:text-dark-text min-w-[100px] text-center"
              autoFocus
            />
          </View>
        </View>
      </View>

      <Button onPress={handleFinish} size="lg" className="mt-4">
        All Set!
      </Button>
    </View>
  );

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg">
      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </View>
  );
};

export default OnboardingScreen;
