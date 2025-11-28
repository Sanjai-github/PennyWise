import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import * as Icons from 'lucide-react-native';
import { useCategoryStore } from '../store/useCategoryStore';
import { useColorScheme } from 'nativewind';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  'Coffee', 'ShoppingBag', 'Home', 'Car', 'Heart', 'DollarSign', 
  'Briefcase', 'Gift', 'TrendingUp', 'Smartphone', 'Wifi', 'Zap', 
  'Book', 'Music', 'Video', 'Gamepad', 'Plane', 'Umbrella'
];

const AVAILABLE_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107',
  '#FF9800', '#FF5722', '#795548', '#607D8B'
];

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ visible, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedIcon, setSelectedIcon] = useState('Coffee');
  const [selectedColor, setSelectedColor] = useState('#FF6384');
  
  const { addCategory, isLoading } = useCategoryStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      await addCategory({
        name: name.trim(),
        type,
        icon: selectedIcon,
        color: selectedColor,
        isCustom: true,
      });
      setName('');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add category');
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="New Category"
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="gap-6 pb-6">
          {/* Type Toggle */}
          <View className="flex-row bg-light-surface dark:bg-dark-surface p-1 rounded-xl">
            <View className="flex-1">
              <Button 
                onPress={() => setType('income')}
                variant={type === 'income' ? 'primary' : 'ghost'}
                size="sm"
              >
                Income
              </Button>
            </View>
            <View className="flex-1">
              <Button 
                onPress={() => setType('expense')}
                variant={type === 'expense' ? 'primary' : 'ghost'}
                size="sm"
              >
                Expense
              </Button>
            </View>
          </View>

          {/* Name Input */}
          <Input
            label="Category Name"
            placeholder="e.g. Gym, Netflix"
            value={name}
            onChangeText={setName}
          />

          {/* Icon Selector */}
          <View>
            <Text className="text-light-text dark:text-dark-text font-medium mb-3">Icon</Text>
            <View className="flex-row flex-wrap gap-3">
              {AVAILABLE_ICONS.map((iconName) => {
                // @ts-ignore
                const Icon = Icons[iconName] || Icons.HelpCircle;
                const isSelected = selectedIcon === iconName;
                
                return (
                  <TouchableOpacity
                    key={iconName}
                    onPress={() => setSelectedIcon(iconName)}
                    className={`w-12 h-12 rounded-xl items-center justify-center border ${
                      isSelected 
                        ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary' 
                        : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border'
                    }`}
                  >
                    <Icon 
                      size={24} 
                      color={isSelected ? '#FFF' : (isDark ? '#A0A0A0' : '#6B6B6B')} 
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Color Selector */}
          <View>
            <Text className="text-light-text dark:text-dark-text font-medium mb-3">Color</Text>
            <View className="flex-row flex-wrap gap-3">
              {AVAILABLE_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                
                return (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full items-center justify-center border-2 ${
                      isSelected ? 'border-light-text dark:border-dark-text' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {isSelected && <Icons.Check size={16} color="#FFF" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Button 
            onPress={handleSave} 
            variant="primary" 
            size="lg"
            loading={isLoading}
            className="mt-4"
          >
            Create Category
          </Button>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default AddCategoryModal;
