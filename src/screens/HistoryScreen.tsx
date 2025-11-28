import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, SectionList, Alert } from 'react-native';
import { useTransactionStore } from '../store/useTransactionStore';
import { useAccountStore } from '../store/useAccountStore';
import TransactionItem from '../components/TransactionItem';
import EditTransactionModal from './EditTransactionModal';
import { Search, Filter, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Transaction } from '../db/schema';

const HistoryScreen = () => {
  const { transactions, deleteTransaction } = useTransactionStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // --- Filtering & Grouping ---
  const sections = useMemo(() => {
    let filtered = transactions;

    // 1. Filter by Type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // 2. Filter by Search (Note or Category)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        (t.note && t.note.toLowerCase().includes(query)) ||
        (t.category && t.category.toLowerCase().includes(query))
      );
    }

    // 3. Sort by Date Descending
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 4. Group by Date
    const grouped: Record<string, typeof transactions> = {};
    filtered.forEach(t => {
      const date = new Date(t.date);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let title = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      if (date.toDateString() === today.toDateString()) {
        title = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        title = 'Yesterday';
      }

      if (!grouped[title]) {
        grouped[title] = [];
      }
      grouped[title].push(t);
    });

    return Object.keys(grouped).map(title => ({
      title,
      data: grouped[title],
    }));
  }, [transactions, filterType, searchQuery]);

  const handleLongPress = (transaction: Transaction) => {
    Alert.alert(
      'Manage Transaction',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Edit',
          onPress: () => {
            setSelectedTransaction(transaction);
            setIsEditModalVisible(true);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Transaction',
              'Are you sure you want to delete this transaction?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteTransaction(transaction.id);
                    useAccountStore.getState().loadAccounts();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const textColor = isDark ? '#E8E8E8' : '#2C2C2C';
  const placeholderColor = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg pt-16 px-6">
      <Text className="text-light-text dark:text-dark-text text-2xl font-bold mb-6" style={{ fontFamily: 'Outfit_700Bold' }}>
        History
      </Text>

      {/* Search & Filter Bar */}
      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 flex-row items-center bg-light-surface dark:bg-dark-surface rounded-xl px-4 border border-light-border dark:border-dark-border h-12">
          <Search size={20} color={placeholderColor} />
          <TextInput
            className="flex-1 ml-3 text-light-text dark:text-dark-text font-medium"
            placeholder="Search transactions..."
            placeholderTextColor={placeholderColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={placeholderColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row mb-6 bg-light-surface dark:bg-dark-surface p-1 rounded-xl border border-light-border dark:border-dark-border">
        {(['all', 'income', 'expense'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilterType(type)}
            className={`flex-1 items-center justify-center py-2 rounded-lg ${
              filterType === type ? 'bg-light-primary dark:bg-dark-primary' : ''
            }`}
          >
            <Text
              className={`font-semibold capitalize ${
                filterType === type ? 'text-white' : 'text-light-text-secondary dark:text-dark-text-secondary'
              }`}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="mb-3">
            <TransactionItem 
              transaction={item} 
              onLongPress={() => handleLongPress(item)}
            />
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text className="text-light-text-secondary dark:text-dark-text-secondary font-bold text-xs uppercase tracking-wider mb-3 mt-2">
            {title}
          </Text>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-light-text-secondary dark:text-dark-text-secondary text-center">
              No transactions found.
            </Text>
          </View>
        }
      />

      {/* Edit Modal */}
      <EditTransactionModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        transaction={selectedTransaction}
      />
    </View>
  );
};

export default HistoryScreen;
