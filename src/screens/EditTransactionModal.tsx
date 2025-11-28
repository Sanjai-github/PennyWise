import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import CategorySelector from '../components/CategorySelector';
import { useTransactionStore } from '../store/useTransactionStore';
import { Transaction } from '../db/schema';

interface EditTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ visible, onClose, transaction }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  
  const { updateTransaction, isLoading } = useTransactionStore();

  useEffect(() => {
    if (visible && transaction) {
      setType(transaction.type as 'income' | 'expense');
      setAmount(transaction.amount.toString());
      setNote(transaction.note || '');
      setCategory(transaction.category);
    }
  }, [visible, transaction]);

  const handleSave = async () => {
    if (!transaction) return;

    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      await updateTransaction(transaction.id, {
        amount: parseFloat(amount),
        type,
        category,
        note,
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update transaction');
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Edit Transaction"
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
            Save Changes
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default EditTransactionModal;
