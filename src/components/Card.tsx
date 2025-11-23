import React from 'react';
import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
}

const Card: React.FC<CardProps> = ({ children, variant = 'default' }) => {
  return (
    <View
      className={`
        bg-light-card dark:bg-dark-card
        border border-light-border dark:border-dark-border
        rounded-2xl
        p-4
        ${variant === 'elevated' ? 'shadow-lg' : ''}
      `}
    >
      {children}
    </View>
  );
};

export default Card;
