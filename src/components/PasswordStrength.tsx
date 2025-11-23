import React from 'react';
import { View, Text } from 'react-native';

interface PasswordStrengthProps {
  score: number; // 0 to 4
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ score }) => {
  const getStrengthLabel = () => {
    switch (score) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const getStrengthColor = () => {
    switch (score) {
      case 0: return 'bg-gray-300 dark:bg-gray-700';
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-300 dark:bg-gray-700';
    }
  };

  return (
    <View className="mt-2">
      <View className="flex-row gap-1 h-1 mb-1">
        {[1, 2, 3, 4].map((level) => (
          <View 
            key={level} 
            className={`flex-1 rounded-full ${score >= level ? getStrengthColor() : 'bg-gray-200 dark:bg-gray-800'}`} 
          />
        ))}
      </View>
      <Text className={`text-xs text-right ${score > 0 ? 'text-light-text-secondary dark:text-dark-text-secondary' : 'text-transparent'}`}>
        {getStrengthLabel()}
      </Text>
    </View>
  );
};

export default PasswordStrength;
