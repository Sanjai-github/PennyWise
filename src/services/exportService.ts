import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Alert } from 'react-native';
import { db } from '../db/client';
import { transactions } from '../db/schema';
import { desc } from 'drizzle-orm';
import { useSettingsStore } from '../store/useSettingsStore';

export const exportData = async (format: 'csv' | 'pdf') => {
  try {
    // 1. Fetch all transactions
    const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.date));

    if (allTransactions.length === 0) {
      Alert.alert('No Data', 'There are no transactions to export.');
      return;
    }

    // 2. Get Currency
    const { currencySymbol } = useSettingsStore.getState();

    // 3. Calculate Analytics
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown: Record<string, number> = {};

    allTransactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const analytics = {
      totalIncome,
      totalExpense,
      netBalance,
      categoryBreakdown
    };

    if (format === 'csv') {
      await generateAndShareCSV(allTransactions, analytics, currencySymbol);
    } else {
      await generateAndSharePDF(allTransactions, analytics, currencySymbol);
    }
  } catch (error: any) {
    console.error('Export failed:', error);
    Alert.alert('Export Failed', error.message || 'Unknown error occurred');
  }
};

const generateAndShareCSV = async (data: any[], analytics: any, currencySymbol: string) => {
  // 1. Summary Section
  let csvContent = 'FINANCIAL SUMMARY\n';
  csvContent += `Total Income,${currencySymbol}${analytics.totalIncome.toFixed(2)}\n`;
  csvContent += `Total Expense,${currencySymbol}${analytics.totalExpense.toFixed(2)}\n`;
  csvContent += `Net Balance,${currencySymbol}${analytics.netBalance.toFixed(2)}\n\n`;

  // 2. Category Breakdown
  csvContent += 'CATEGORY BREAKDOWN (EXPENSES)\n';
  csvContent += 'Category,Amount\n';
  Object.entries(analytics.categoryBreakdown).forEach(([category, amount]) => {
    csvContent += `${category},${currencySymbol}${(amount as number).toFixed(2)}\n`;
  });
  csvContent += '\n';

  // 3. Transactions Header
  csvContent += 'TRANSACTION HISTORY\n';
  csvContent += 'Date,Type,Category,Amount,Note\n';

  // 4. Transactions Rows
  const rows = data.map(t => {
    const date = new Date(t.date).toLocaleDateString();
    const type = t.type;
    const category = t.category;
    const amount = `${currencySymbol}${t.amount.toFixed(2)}`;
    const note = t.note ? `"${t.note.replace(/"/g, '""')}"` : '';
    return `${date},${type},${category},${amount},${note}`;
  }).join('\n');

  csvContent += rows;

  // 5. Write and Share
  const fileUri = FileSystem.cacheDirectory + 'pennywise_export.csv';
  await FileSystem.writeAsStringAsync(fileUri, csvContent);

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

const generateAndSharePDF = async (data: any[], analytics: any, currencySymbol: string) => {
  const html = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          h1 { text-align: center; color: #4F46E5; margin-bottom: 10px; }
          .subtitle { text-align: center; color: #666; margin-bottom: 40px; }
          
          .summary-grid { display: flex; gap: 20px; margin-bottom: 40px; }
          .card { flex: 1; padding: 20px; border-radius: 12px; background: #f8f9fa; border: 1px solid #e9ecef; text-align: center; }
          .card-title { font-size: 14px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
          .card-value { font-size: 24px; font-weight: bold; }
          .text-green { color: #10B981; }
          .text-red { color: #EF4444; }
          .text-blue { color: #3B82F6; }

          h2 { font-size: 18px; color: #1F2937; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-top: 40px; margin-bottom: 20px; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
          th { text-align: left; padding: 12px; background-color: #F3F4F6; color: #374151; font-weight: 600; border-bottom: 2px solid #E5E7EB; }
          td { padding: 12px; border-bottom: 1px solid #E5E7EB; color: #4B5563; }
          tr:last-child td { border-bottom: none; }
          
          .amount-col { text-align: right; font-family: monospace; font-size: 15px; }
          .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; text-transform: uppercase; }
          .badge-income { background: #D1FAE5; color: #065F46; }
          .badge-expense { background: #FEE2E2; color: #991B1B; }
        </style>
      </head>
      <body>
        <h1>PennyWise Report</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleString()}</p>

        <!-- Summary Cards -->
        <div class="summary-grid">
          <div class="card">
            <div class="card-title">Total Income</div>
            <div class="card-value text-green">${currencySymbol}${analytics.totalIncome.toFixed(2)}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Expenses</div>
            <div class="card-value text-red">${currencySymbol}${analytics.totalExpense.toFixed(2)}</div>
          </div>
          <div class="card">
            <div class="card-title">Net Balance</div>
            <div class="card-value text-blue">${currencySymbol}${analytics.netBalance.toFixed(2)}</div>
          </div>
        </div>

        <!-- Category Breakdown -->
        <h2>Spending by Category</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th class="amount-col">Amount</th>
              <th class="amount-col">% of Total</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(analytics.categoryBreakdown).map(([cat, amount]) => {
              const percent = analytics.totalExpense > 0 ? ((amount as number) / analytics.totalExpense * 100).toFixed(1) : '0.0';
              return `
                <tr>
                  <td>${cat}</td>
                  <td class="amount-col">${currencySymbol}${(amount as number).toFixed(2)}</td>
                  <td class="amount-col">${percent}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Transaction History -->
        <h2>Transaction History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Note</th>
              <th class="amount-col">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td><span class="badge badge-${t.type}">${t.type}</span></td>
                <td>${t.category}</td>
                <td>${t.note || '-'}</td>
                <td class="amount-col ${t.type === 'income' ? 'text-green' : 'text-red'}">
                  ${t.type === 'income' ? '+' : '-'}${currencySymbol}${t.amount.toFixed(2)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });

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
