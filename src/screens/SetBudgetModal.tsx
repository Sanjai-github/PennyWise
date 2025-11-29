import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Switch } from 'react-native';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { useBudgetStore } from '../store/useBudgetStore';
import { useSettingsStore } from '../store/useSettingsStore';

interface SetBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  category: string | null;
  currentLimit?: number;
  currentRollover?: boolean;
}

const SetBudgetModal: React.FC<SetBudgetModalProps> = ({ visible, onClose, category, currentLimit, currentRollover }) => {
  const [amount, setAmount] = useState('');
  const [rolloverEnabled, setRolloverEnabled] = useState(false);
  const { setBudget, isLoading } = useBudgetStore();
  const { currencySymbol } = useSettingsStore();

  useEffect(() => {
    if (visible && currentLimit) {
      setAmount(currentLimit.toString());
      setRolloverEnabled(currentRollover || false);
    } else {
      setAmount('');
      setRolloverEnabled(false);
    }
  }, [visible, currentLimit, currentRollover]);

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
        rolloverEnabled,
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
          <Text className="text-light-text dark:text-dark-text font-medium mb-2">Monthly Limit ({currencySymbol})</Text>
          <Input
            placeholder={`${currencySymbol}0.00`}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            className="text-3xl font-bold text-center h-16"
          />
        </View>

        <View className="flex-row items-center justify-between bg-light-surface dark:bg-dark-surface p-4 rounded-xl border border-light-border dark:border-dark-border">
          <View className="flex-1 mr-4">
            <Text className="text-light-text dark:text-dark-text font-bold text-base mb-1">Rollover Budget</Text>
            <Text className="text-light-text-secondary dark:text-dark-text-secondary text-xs">
              Add unused budget from last month to this month's limit.
            </Text>
          </View>
          <Switch
            value={rolloverEnabled}
            onValueChange={setRolloverEnabled}
            trackColor={{ false: '#E5E7EB', true: '#818CF8' }}
            thumbColor="#FFF"
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
