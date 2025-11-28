import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { createBackup, restoreBackup } from '../services/backupService';
import { exportData } from '../services/exportService';
import { ArrowLeft, Upload, Download, LogOut, ChevronRight, Shield, Grid, Moon, Sun, FileText, FileSpreadsheet } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface SettingsScreenProps {
  onBack: () => void;
  onNavigateToCategories: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onNavigateToCategories }) => {
  const { logout, user } = useAuthStore();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#E8E8E8' : '#2C2C2C';

  const handleBackup = async () => {
    await createBackup();
  };

  const handleRestore = async () => {
    await restoreBackup(() => {
      // Reload app data or restart
    });
  };

  const handleExportCSV = async () => {
    await exportData('csv');
  };

  const handleExportPDF = async () => {
    await exportData('pdf');
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg pt-16 px-6">
      {/* Header */}
      <View className="flex-row items-center mb-8">
        <TouchableOpacity 
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-light-surface dark:bg-dark-surface items-center justify-center border border-light-border dark:border-dark-border mr-4"
        >
          <ArrowLeft size={20} color={iconColor} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-light-text dark:text-dark-text" style={{ fontFamily: 'Outfit_700Bold' }}>
          Settings
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl mb-6 border border-light-border dark:border-dark-border">
          <View className="flex-row items-center gap-4 mb-4">
            <View className="w-16 h-16 rounded-full bg-light-primary dark:bg-dark-primary items-center justify-center">
              <Text className="text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text className="text-light-text dark:text-dark-text text-lg font-bold">
                {user?.name || 'User'}
              </Text>
              <Text className="text-light-text-secondary dark:text-dark-text-secondary">
                {user?.email || 'email@example.com'}
              </Text>
            </View>
          </View>
        </View>

        {/* General Settings */}
        <Text className="text-light-text-secondary dark:text-dark-text-secondary font-bold text-xs uppercase tracking-wider mb-3 ml-1">
          General
        </Text>
        
        <View className="bg-light-surface dark:bg-dark-surface rounded-2xl mb-6 border border-light-border dark:border-dark-border overflow-hidden">
          <View className="flex-row items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 items-center justify-center">
                {isDark ? <Moon size={18} color="#3B82F6" /> : <Sun size={18} color="#3B82F6" />}
              </View>
              <Text className="text-light-text dark:text-dark-text font-medium">Dark Mode</Text>
            </View>
            <Switch 
              value={isDark} 
              onValueChange={toggleColorScheme}
              trackColor={{ false: '#E5E7EB', true: '#818CF8' }}
              thumbColor="#FFF"
            />
          </View>

          <TouchableOpacity 
            onPress={onNavigateToCategories}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 items-center justify-center">
                <Grid size={18} color="#A855F7" />
              </View>
              <Text className="text-light-text dark:text-dark-text font-medium">Manage Categories</Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <Text className="text-light-text-secondary dark:text-dark-text-secondary font-bold text-xs uppercase tracking-wider mb-3 ml-1">
          Data Management
        </Text>
        <View className="bg-light-surface dark:bg-dark-surface rounded-2xl mb-6 border border-light-border dark:border-dark-border overflow-hidden">
          <TouchableOpacity 
            onPress={handleBackup}
            className="p-4 flex-row items-center justify-between border-b border-light-border dark:border-dark-border"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                <Upload size={18} color="#2196F3" />
              </View>
              <Text className="text-light-text dark:text-dark-text font-medium text-base">
                Backup Data
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#555' : '#CCC'} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleRestore}
            className="p-4 flex-row items-center justify-between border-b border-light-border dark:border-dark-border"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
                <Download size={18} color="#FF9800" />
              </View>
              <Text className="text-light-text dark:text-dark-text font-medium text-base">
                Restore Data
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#555' : '#CCC'} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleExportCSV}
            className="p-4 flex-row items-center justify-between border-b border-light-border dark:border-dark-border"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
                <FileSpreadsheet size={18} color="#4CAF50" />
              </View>
              <Text className="text-light-text dark:text-dark-text font-medium text-base">
                Export as CSV
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#555' : '#CCC'} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleExportPDF}
            className="p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center">
                <FileText size={18} color="#F44336" />
              </View>
              <Text className="text-light-text dark:text-dark-text font-medium text-base">
                Export as PDF
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#555' : '#CCC'} />
          </TouchableOpacity>
        </View>

        {/* Security */}
        <Text className="text-light-text-secondary dark:text-dark-text-secondary font-bold text-xs uppercase tracking-wider mb-3 ml-1">
          Security
        </Text>
        <View className="bg-light-surface dark:bg-dark-surface rounded-2xl mb-6 border border-light-border dark:border-dark-border overflow-hidden">
          <TouchableOpacity className="p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
                <Shield size={18} color="#4CAF50" />
              </View>
              <Text className="text-light-text dark:text-dark-text font-medium text-base">
                Change Password
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#555' : '#CCC'} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex-row items-center justify-center gap-2 mb-8"
        >
          <LogOut size={20} color="#F44336" />
          <Text className="text-red-500 font-bold text-base">Log Out</Text>
        </TouchableOpacity>

        <Text className="text-center text-light-text-secondary dark:text-dark-text-secondary text-xs mb-8">
          Penny Wise v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
