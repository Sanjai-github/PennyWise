import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Alert } from 'react-native';
import { db } from '../db/client';
import { transactions } from '../db/schema';
import { desc } from 'drizzle-orm';

export const exportData = async (format: 'csv' | 'pdf') => {
  try {
    // 1. Fetch all transactions
    const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.date));

    if (allTransactions.length === 0) {
      Alert.alert('No Data', 'There are no transactions to export.');
      return;
    }

    if (format === 'csv') {
      await generateAndShareCSV(allTransactions);
    } else {
      await generateAndSharePDF(allTransactions);
    }
  } catch (error: any) {
    console.error('Export failed:', error);
    Alert.alert('Export Failed', error.message || 'Unknown error occurred');
  }
};

const generateAndShareCSV = async (data: any[]) => {
  // 1. Create CSV Header
  const header = 'Date,Type,Category,Amount,Note\n';

  // 2. Create CSV Rows
  const rows = data.map(t => {
    const date = new Date(t.date).toLocaleDateString();
    const type = t.type;
    const category = t.category;
    const amount = t.amount.toFixed(2);
    const note = t.note ? `"${t.note.replace(/"/g, '""')}"` : ''; // Escape quotes
    return `${date},${type},${category},${amount},${note}`;
  }).join('\n');

  const csvContent = header + rows;

  // 3. Write to temp file
  const fileUri = FileSystem.cacheDirectory + 'pennywise_export.csv';
  await FileSystem.writeAsStringAsync(fileUri, csvContent);

  // 4. Share
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export CSV',
      UTI: 'public.comma-separated-values-text',
    });
  } else {
    Alert.alert('Error', 'Sharing is not available on this device');
  }
};

const generateAndSharePDF = async (data: any[]) => {
  // 1. Generate HTML
  const html = `
    <html>
      <head>
        <style>
          body { font-family: Helvetica, Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #4F46E5; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .amount-income { color: #4CAF50; }
          .amount-expense { color: #F44336; }
        </style>
      </head>
      <body>
        <h1>PennyWise Transaction History</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td style="text-transform: capitalize;">${t.type}</td>
                <td>${t.category}</td>
                <td class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}">
                  ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                </td>
                <td>${t.note || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // 2. Print/Generate PDF
  const { uri } = await Print.printToFileAsync({ html });

  // 3. Share
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Export PDF',
      UTI: 'com.adobe.pdf',
    });
  } else {
    Alert.alert('Error', 'Sharing is not available on this device');
  }
};
