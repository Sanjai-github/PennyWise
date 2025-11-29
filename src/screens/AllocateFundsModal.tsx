import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useSettingsStore } from '../store/useSettingsStore';

interface AllocateFundsModalProps {
  visible: boolean;
  onClose: () => void;
  onAllocate: (amount: number) => void;
  walletBalance: number;
  goalName: string;
}

const AllocateFundsModal: React.FC<AllocateFundsModalProps> = ({ visible, onClose, onAllocate, walletBalance, goalName }) => {
  const [amount, setAmount] = useState('');
  const { colorScheme } = useColorScheme();
  const { currencySymbol } = useSettingsStore();
  const isDark = colorScheme === 'dark';

  const handleAllocate = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      return;
    }
    if (val > walletBalance) {
      return;
    }
    onAllocate(val);
    setAmount('');
    onClose();
  };

  const handleAddAll = () => {
    setAmount(walletBalance.toString());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="w-full bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-light-border dark:border-dark-border"
            >
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                  Fund Goal
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <X size={24} color={isDark ? '#FFF' : '#000'} />
                </TouchableOpacity>
              </View>

              <Text className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                Add funds to "{goalName}" from your wallet.
              </Text>

              <View className="mb-6">
                <Text className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Available: {currencySymbol}{walletBalance.toFixed(2)}
                </Text>
                <View className="flex-row items-center bg-light-bg dark:bg-dark-bg rounded-xl px-4 border border-light-border dark:border-dark-border">
                  <Text className="text-lg font-bold text-light-text dark:text-dark-text mr-2">
                    {currencySymbol}
                  </Text>
                  <TextInput
                    className="flex-1 py-4 text-lg font-bold text-light-text dark:text-dark-text"
                    placeholder="0.00"
                    placeholderTextColor={isDark ? '#555' : '#AAA'}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    autoFocus
                  />
                  <TouchableOpacity 
                    onPress={handleAddAll}
                    className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-lg"
                  >
                    <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">MAX</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={onClose}
                  className="flex-1 py-4 rounded-xl bg-light-bg dark:bg-dark-bg items-center"
                >
                  <Text className="font-bold text-light-text dark:text-dark-text">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleAllocate}
                  className={`flex-1 py-4 rounded-xl items-center ${
                    !amount || parseFloat(amount) <= 0 || parseFloat(amount) > walletBalance
                      ? 'bg-gray-300 dark:bg-gray-700' 
                      : 'bg-indigo-600'
                  }`}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > walletBalance}
                >
                  <Text className="font-bold text-white">Add Funds</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AllocateFundsModal;
