import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, ScrollView } from 'react-native';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { useGoalStore } from '../store/useGoalStore';
import * as Icons from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
}

const GOAL_ICONS = [
  { name: 'Laptop', color: '#4CAF50' },
  { name: 'Car', color: '#2196F3' },
  { name: 'Home', color: '#9C27B0' },
  { name: 'Plane', color: '#FF9800' },
  { name: 'GraduationCap', color: '#F44336' },
  { name: 'Smartphone', color: '#607D8B' },
  { name: 'Gift', color: '#E91E63' },
  { name: 'Heart', color: '#FF5722' },
];

const AddGoalModal: React.FC<AddGoalModalProps> = ({ visible, onClose }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(GOAL_ICONS[0]);
  
  const { addGoal, isLoading } = useGoalStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a goal name');
      return;
    }
    if (!targetAmount || isNaN(parseFloat(targetAmount))) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return;
    }

    try {
      await addGoal({
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        icon: selectedIcon.name,
        color: selectedIcon.color,
        createdAt: new Date(),
      });
      setName('');
      setTargetAmount('');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add goal');
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="New Goal"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 24, paddingBottom: 24 }}>
        {/* Icon Selector */}
        <View>
          <Text className="text-light-text dark:text-dark-text font-medium mb-3">Choose Icon</Text>
          <View className="flex-row flex-wrap gap-3">
            {GOAL_ICONS.map((icon) => {
              // @ts-ignore
              const IconComponent = Icons[icon.name] || Icons.HelpCircle;
              const isSelected = selectedIcon.name === icon.name;

              return (
                <TouchableOpacity
                  key={icon.name}
                  onPress={() => setSelectedIcon(icon)}
                  className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
                    isSelected ? 'border-light-primary dark:border-dark-primary' : 'border-transparent bg-light-surface dark:bg-dark-surface'
                  }`}
                  style={isSelected ? { backgroundColor: icon.color + '20', borderColor: icon.color } : {}}
                >
                  <IconComponent 
                    size={24} 
                    color={isSelected ? icon.color : (isDark ? '#A0A0A0' : '#6B6B6B')} 
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Name Input */}
        <Input
          label="Goal Name"
          placeholder="e.g. New Laptop"
          value={name}
          onChangeText={setName}
        />

        {/* Target Amount Input */}
        <Input
          label="Target Amount"
          placeholder="0.00"
          value={targetAmount}
          onChangeText={setTargetAmount}
          keyboardType="numeric"
        />

        <Button 
          onPress={handleSave} 
          variant="primary" 
          size="lg"
          loading={isLoading}
        >
          Create Goal
        </Button>
      </ScrollView>
    </Modal>
  );
};

export default AddGoalModal;
