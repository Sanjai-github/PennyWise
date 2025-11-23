import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Coffee, ShoppingBag, Home, Car, DollarSign, Heart, Briefcase, Gift, TrendingUp } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface CategorySelectorProps {
  type: 'income' | 'expense';
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const EXPENSE_CATEGORIES = [
  { id: 'Food', icon: Coffee },
  { id: 'Transport', icon: Car },
  { id: 'Shopping', icon: ShoppingBag },
  { id: 'Housing', icon: Home },
  { id: 'Health', icon: Heart },
  { id: 'Other', icon: DollarSign },
];

const INCOME_CATEGORIES = [
  { id: 'Salary', icon: Briefcase },
  { id: 'Freelance', icon: Briefcase },
  { id: 'Gift', icon: Gift },
  { id: 'Investment', icon: TrendingUp },
  { id: 'Other', icon: DollarSign },
];

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  type, 
  selectedCategory, 
  onSelectCategory 
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <View>
      <Text className="text-light-text dark:text-dark-text font-medium mb-3">Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;
          
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory(cat.id)}
              className={`
                flex-row items-center gap-2 px-4 py-2 rounded-full border mr-2
                ${isSelected 
                  ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary' 
                  : 'bg-transparent border-light-border dark:border-dark-border'
                }
              `}
            >
              <Icon 
                size={16} 
                color={isSelected 
                  ? (isDark ? '#FFF' : '#2C2C2C') 
                  : (isDark ? '#A0A0A0' : '#6B6B6B')
                } 
              />
              <Text 
                className={`
                  font-medium
                  ${isSelected 
                    ? 'text-light-text dark:text-dark-text' 
                    : 'text-light-text-secondary dark:text-dark-text-secondary'
                  }
                `}
              >
                {cat.id}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategorySelector;
