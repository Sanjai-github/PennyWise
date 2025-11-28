import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import CategorySelector from '../components/CategorySelector';
import { useTransactionStore } from '../store/useTransactionStore';
import { useAccountStore } from '../store/useAccountStore';

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense';
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ visible, onClose, initialType = 'expense' }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [category, setCategory] = useState('');
  
  const { addTransaction, isLoading } = useTransactionStore();
  const { accounts } = useAccountStore();

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setType(initialType);
      setAmount('');
      setNote('');
      setCategory('');
    }
  }, [visible, initialType]);

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (accounts.length === 0) {
      Alert.alert('Error', 'No accounts found. Please add an account first.');
      return;
    }

    // Default to first account for now
    const accountId = accounts[0].id;

    try {
      await addTransaction({
        accountId,
        amount: parseFloat(amount),
        date: new Date(),
        type,
        category,
        note,
        createdAt: new Date(),
      });
      // Refresh accounts to update balance
      useAccountStore.getState().loadAccounts();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`Add ${type === 'income' ? 'Income' : 'Expense'}`}
    >
      <View className="flex-1 gap-6">
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

        {/* Amount Input */}
        <View>
          <Text className="text-light-text dark:text-dark-text font-medium mb-2">Amount</Text>
          <Input
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            className="text-3xl font-bold text-center h-16"
          />
        </View>

        {/* Category Selector */}
        <CategorySelector
          type={type}
          selectedCategory={category}
          onSelectCategory={setCategory}
        />

        {/* Note Input */}
        <Input
          label="Note (Optional)"
          placeholder="What was this for?"
          value={note}
          onChangeText={setNote}
        />

        <View className="flex-1 justify-end mb-4">
          <Button 
            onPress={handleSave} 
            variant="primary" 
            size="lg"
            loading={isLoading}
          >
            Save Transaction
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default QuickAddModal;
