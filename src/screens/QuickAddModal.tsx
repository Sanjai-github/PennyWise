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
    let accountId = accounts.length > 0 ? accounts[0].id : -1;

    if (accounts.length === 0) {
      // Auto-create default account
      const { currency } = require('../store/useSettingsStore').useSettingsStore.getState();
      const { addAccount } = useAccountStore.getState();
      
      try {
        await addAccount({
          name: 'Cash',
          type: 'cash',
          balance: 0,
          currency: currency,
        });
        
        // Refresh accounts list to get the new ID
        await useAccountStore.getState().loadAccounts();
        const updatedAccounts = useAccountStore.getState().accounts;
        if (updatedAccounts.length > 0) {
          accountId = updatedAccounts[0].id;
        } else {
          Alert.alert('Error', 'Failed to create default account');
          return;
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to create default account');
        return;
      }
    }

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

      // Check for budget and show alert
      if (type === 'expense') {
        const { budgets } = require('../store/useBudgetStore').useBudgetStore.getState();
        const { transactions } = useTransactionStore.getState();
        const { showAlert } = require('../store/useBudgetAlertStore').useBudgetAlertStore.getState();

        const budget = budgets.find((b: any) => b.category === category);
        
        if (budget) {
          // Calculate spent BEFORE this transaction
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          const spentBefore = transactions
            .filter((t: any) => {
              const tDate = new Date(t.date);
              return t.type === 'expense' && 
                     t.category === category && 
                     tDate.getMonth() === currentMonth && 
                     tDate.getFullYear() === currentYear &&
                     t.id !== undefined; // Exclude the one just added if it's already in the list (it shouldn't be yet usually, but safe to check)
            })
            .reduce((sum: number, t: any) => sum + t.amount, 0);

          // The store updates optimistically or quickly, so we might need to subtract the current amount if it was already added to the store
          // But here we are calling this right after addTransaction. 
          // Let's assume addTransaction updates the store.
          // Actually, let's calculate based on what we know.
          
          // We know the limit and the amount we just added.
          // We need the spent amount *excluding* the current one to show "Remaining Before".
          // But the requirement is "Current budget balance minus that current expense transaction".
          // So: (Limit - SpentBefore) - CurrentAmount = NewRemaining.
          
          // Let's recalculate spent from the store, which should now include the new transaction
          const updatedTransactions = useTransactionStore.getState().transactions;
           const totalSpent = updatedTransactions
            .filter((t: any) => {
              const tDate = new Date(t.date);
              return t.type === 'expense' && 
                     t.category === category && 
                     tDate.getMonth() === currentMonth && 
                     tDate.getFullYear() === currentYear;
            })
            .reduce((sum: number, t: any) => sum + t.amount, 0);
            
          const spentBeforeThis = totalSpent - parseFloat(amount);
          const remainingBefore = budget.amount - spentBeforeThis;

          showAlert({
            category,
            remainingBefore,
            transactionAmount: parseFloat(amount),
            limit: budget.amount,
          });
        }
      }

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
