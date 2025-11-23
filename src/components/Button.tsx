import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-light-primary dark:bg-dark-primary border-transparent';
      case 'secondary':
        return 'bg-light-secondary dark:bg-dark-secondary border-transparent';
      case 'outline':
        return 'bg-transparent border-light-primary dark:border-dark-primary border';
      case 'ghost':
        return 'bg-transparent border-transparent';
      default:
        return 'bg-light-primary dark:bg-dark-primary border-transparent';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return 'text-light-text dark:text-white';
      case 'secondary':
        return 'text-white';
      case 'outline':
        return 'text-light-primary dark:text-dark-primary';
      case 'ghost':
        return 'text-light-text-secondary dark:text-dark-text-secondary';
      default:
        return 'text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'py-1 px-3';
      case 'md':
        return 'py-3 px-6';
      case 'lg':
        return 'py-4 px-8';
      default:
        return 'py-3 px-6';
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        rounded-xl flex-row justify-center items-center
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${disabled ? 'opacity-50' : 'opacity-100'}
        ${className}
      `}
      style={({ pressed }) => ({
        opacity: pressed && !disabled ? 0.7 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#6B4EFF' : '#FFF'} />
      ) : (
        <Text 
          className={`font-semibold text-center ${getTextStyles()} ${getTextSizeStyles()}`}
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
};

export default Button;
