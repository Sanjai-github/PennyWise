import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { db } from '../db/client';
import { users, accounts, transactions } from '../db/schema';
import { sql } from 'drizzle-orm';

export const createBackup = async () => {
  try {
    // 1. Fetch all data
    const allUsers = await db.select().from(users);
    const allAccounts = await db.select().from(accounts);
    const allTransactions = await db.select().from(transactions);

    // 2. Create backup object
    const backupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: {
        users: allUsers,
        accounts: allAccounts,
        transactions: allTransactions,
      },
    };

    // 3. Write to temp file
    const fileUri = (FileSystem.cacheDirectory || FileSystem.documentDirectory) + 'pennywise_backup.json';
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));

    // 4. Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Save Backup',
        UTI: 'public.json',
      });
    } else {
      Alert.alert('Error', 'Sharing is not available on this device');
    }
  } catch (error: any) {
    console.error('Backup failed:', error);
    Alert.alert('Backup Failed', error.message || 'Unknown error occurred');
  }
};

export const restoreBackup = async (onSuccess: () => void) => {
  try {
    // 1. Pick file
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const fileUri = result.assets[0].uri;

    // 2. Read file
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    const backup = JSON.parse(fileContent);

    // 3. Validate (basic)
    if (!backup.data || !backup.data.users || !backup.data.accounts || !backup.data.transactions) {
      throw new Error('Invalid backup file format');
    }

    // 4. Confirm overwrite
    Alert.alert(
      'Restore Backup',
      'This will replace ALL current data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              // 5. Perform restore (Transaction)
              // Note: Drizzle with Expo SQLite doesn't support complex transactions easily in this setup 
              // without raw queries for some drivers, but we'll try sequential deletes/inserts.
              // For safety, we should ideally use a transaction block.
              
              // Delete existing data
              await db.delete(transactions);
              await db.delete(accounts);
              await db.delete(users);

              // Insert new data
              // We need to handle potential ID conflicts if we want to preserve exact IDs.
              // Ideally we insert with specific IDs. Drizzle insert values supports this.
              
              if (backup.data.users.length > 0) {
                await db.insert(users).values(backup.data.users);
              }
              if (backup.data.accounts.length > 0) {
                await db.insert(accounts).values(backup.data.accounts);
              }
              if (backup.data.transactions.length > 0) {
                // Fix date strings back to Date objects if needed, but Drizzle might handle ISO strings for timestamp mode?
                // Our schema uses mode: 'timestamp', so it expects Date objects. JSON has strings.
                const formattedTransactions = backup.data.transactions.map((t: any) => ({
                  ...t,
                  date: new Date(t.date),
                  createdAt: new Date(t.createdAt),
                }));
                 const formattedUsers = backup.data.users.map((u: any) => ({
                  ...u,
                  createdAt: new Date(u.createdAt),
                }));
                 const formattedAccounts = backup.data.accounts.map((a: any) => ({
                  ...a,
                  createdAt: new Date(a.createdAt),
                }));

                // Wait, I already inserted users/accounts above without formatting. 
                // Let's redo the insert logic correctly with formatting.
              }

              // Correct logic:
              // Clear tables
              await db.delete(transactions);
              await db.delete(accounts);
              await db.delete(users);

               // Insert Users
              if (backup.data.users.length > 0) {
                 const formattedUsers = backup.data.users.map((u: any) => ({
                  ...u,
                  createdAt: new Date(u.createdAt),
                }));
                await db.insert(users).values(formattedUsers);
              }

              // Insert Accounts
              if (backup.data.accounts.length > 0) {
                 const formattedAccounts = backup.data.accounts.map((a: any) => ({
                  ...a,
                  createdAt: new Date(a.createdAt),
                }));
                await db.insert(accounts).values(formattedAccounts);
              }

              // Insert Transactions
              if (backup.data.transactions.length > 0) {
                const formattedTransactions = backup.data.transactions.map((t: any) => ({
                  ...t,
                  date: new Date(t.date),
                  createdAt: new Date(t.createdAt),
                }));
                await db.insert(transactions).values(formattedTransactions);
              }

              Alert.alert('Success', 'Data restored successfully');
              onSuccess();
            } catch (err: any) {
              console.error('Restore execution failed:', err);
              Alert.alert('Restore Error', 'Failed to write data to database');
            }
          },
        },
      ]
    );
  } catch (error: any) {
    console.error('Restore failed:', error);
    Alert.alert('Restore Failed', error.message || 'Unknown error');
  }
};
