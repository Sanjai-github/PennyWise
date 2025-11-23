import React from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  leftIcon, 
  rightIcon, 
  onRightIconPress, 
  className, 
  ...props 
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="w-full">
      {label && (
        <Text className="text-light-text dark:text-dark-text font-medium mb-2 ml-1">
          {label}
        </Text>
      )}
      <View className={`
        flex-row items-center
        bg-light-surface dark:bg-dark-surface
        border border-light-border dark:border-dark-border
        rounded-xl px-4 h-12
        ${error ? 'border-error' : 'focus:border-light-primary dark:focus:border-dark-primary'}
      `}>
        {leftIcon && (
          <View className="mr-3">
            {leftIcon}
          </View>
        )}
        <TextInput
          className="flex-1 text-light-text dark:text-dark-text text-base h-full"
          placeholderTextColor={isDark ? '#6B6B6B' : '#A0A0A0'}
          style={{ fontFamily: 'Inter_400Regular' }}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress} className="ml-3">
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-error text-sm mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;
