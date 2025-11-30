import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useCategoryStore } from '../store/useCategoryStore';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as Icons from 'lucide-react-native';
import AddCategoryModal from './AddCategoryModal';

import { useAuthStore } from '../store/useAuthStore';

interface ManageCategoriesScreenProps {
  onBack: () => void;
}

const ManageCategoriesScreen: React.FC<ManageCategoriesScreenProps> = ({ onBack }) => {
  const { categories, loadCategories, deleteCategory } = useCategoryStore();
  const { colorScheme } = useColorScheme();
  const { user } = useAuthStore();
  const isDark = colorScheme === 'dark';
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      loadCategories(user.id);
    }
  }, [user]);

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(id),
        },
      ]
    );
  };

  const renderCategoryItem = (category: any) => {
    // @ts-ignore
    const Icon = Icons[category.icon] || Icons.HelpCircle;

    return (
      <View 
        key={category.id} 
        className="flex-row items-center justify-between p-4 bg-light-surface dark:bg-dark-surface rounded-xl mb-3 border border-light-border dark:border-dark-border"
      >
        <View className="flex-row items-center gap-3">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: category.color + '20' }} // 20% opacity
          >
            <Icon size={20} color={category.color} />
          </View>
          <View>
            <Text className="text-light-text dark:text-dark-text font-medium text-base">
              {category.name}
            </Text>
            <Text className="text-light-text-secondary dark:text-dark-text-secondary text-xs capitalize">
              {category.type}
            </Text>
          </View>
        </View>

        {category.isCustom && (
          <TouchableOpacity 
            onPress={() => handleDelete(category.id, category.name)}
            className="p-2"
          >
            <Trash2 size={20} color={isDark ? '#EF4444' : '#DC2626'} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg pt-16 px-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity 
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-light-surface dark:bg-dark-surface items-center justify-center border border-light-border dark:border-dark-border"
        >
          <ArrowLeft size={20} color={isDark ? '#E8E8E8' : '#2C2C2C'} />
        </TouchableOpacity>
        <Text className="text-light-text dark:text-dark-text text-xl font-bold" style={{ fontFamily: 'Outfit_700Bold' }}>
          Manage Categories
        </Text>
        <TouchableOpacity 
          onPress={() => setIsAddModalVisible(true)}
          className="w-10 h-10 rounded-full bg-light-primary dark:bg-dark-primary items-center justify-center"
        >
          <Plus size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-light-text-secondary dark:text-dark-text-secondary font-bold text-xs uppercase tracking-wider mb-3">
          Custom Categories
        </Text>
        {categories.filter(c => c.isCustom).length > 0 ? (
          categories.filter(c => c.isCustom).map(renderCategoryItem)
        ) : (
          <Text className="text-light-text-secondary dark:text-dark-text-secondary text-sm italic mb-6">
            No custom categories yet.
          </Text>
        )}

        <Text className="text-light-text-secondary dark:text-dark-text-secondary font-bold text-xs uppercase tracking-wider mb-3 mt-6">
          Default Categories
        </Text>
        {categories.filter(c => !c.isCustom).map(renderCategoryItem)}
        
        <View className="h-20" /> 
      </ScrollView>

      <AddCategoryModal 
        visible={isAddModalVisible} 
        onClose={() => setIsAddModalVisible(false)} 
      />
    </View>
  );
};

export default ManageCategoriesScreen;
