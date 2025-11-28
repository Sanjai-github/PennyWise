import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import * as Icons from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useCategoryStore } from '../store/useCategoryStore';

interface CategorySelectorProps {
  type: 'income' | 'expense';
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  type, 
  selectedCategory, 
  onSelectCategory 
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { categories, loadCategories } = useCategoryStore();

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <View>
      <Text className="text-light-text dark:text-dark-text font-medium mb-3">Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
        {filteredCategories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          // @ts-ignore
          const Icon = Icons[cat.icon] || Icons.HelpCircle;
          
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory(cat.name)}
              className={`
                flex-row items-center gap-2 px-4 py-2 rounded-full border mr-2
                ${isSelected 
                  ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary' 
                  : 'bg-transparent border-light-border dark:border-dark-border'
                }
              `}
              style={isSelected ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
            >
              <Icon 
                size={16} 
                color={isSelected ? '#FFF' : (isDark ? '#A0A0A0' : '#6B6B6B')} 
              />
              <Text 
                className={`
                  font-medium
                  ${isSelected 
                    ? 'text-white' 
                    : 'text-light-text-secondary dark:text-dark-text-secondary'
                  }
                `}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategorySelector;
