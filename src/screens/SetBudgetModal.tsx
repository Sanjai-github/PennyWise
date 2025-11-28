import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { useBudgetStore } from '../store/useBudgetStore';

interface SetBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  category: string | null;
  currentLimit?: number;
}

const SetBudgetModal: React.FC<SetBudgetModalProps> = ({ visible, onClose, category, currentLimit }) => {
  const [amount, setAmount] = useState('');
  const { setBudget, isLoading } = useBudgetStore();

  useEffect(() => {
    if (visible && currentLimit) {
      setAmount(currentLimit.toString());
    } else {
      setAmount('');
    }
  }, [visible, currentLimit]);

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!category) return;

    try {
      await setBudget({
        category,
        amount: parseFloat(amount),
        createdAt: new Date(),
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to set budget');
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`Set Budget for ${category}`}
    >
      <View className="gap-6 pb-6">
        <View>
          <Text className="text-light-text dark:text-dark-text font-medium mb-2">Monthly Limit</Text>
          <Input
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            className="text-3xl font-bold text-center h-16"
          />
        </View>

        <Button 
          onPress={handleSave} 
          variant="primary" 
          size="lg"
          loading={isLoading}
        >
          Save Limit
        </Button>
      </View>
    </Modal>
  );
};

export default SetBudgetModal;
