import { Transaction, Budget } from '../db/schema';

export const calculateFinancialScore = (transactions: Transaction[], budgets: Budget[]): number => {
  let score = 50; // Base score

  // 1. Savings Rate (30 points)
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  if (income > 0) {
    const savingsRate = (income - expenses) / income;
    if (savingsRate >= 0.2) score += 30;
    else if (savingsRate >= 0.1) score += 20;
    else if (savingsRate > 0) score += 10;
  }

  // 2. Budget Adherence (20 points)
  // Simplified: if total expenses are within total income (living within means)
  if (expenses <= income) score += 20;

  // Clamp score between 0 and 100
  return Math.min(100, Math.max(0, score));
};

export const detectRecurringExpenses = (transactions: Transaction[]) => {
  // Simple logic: look for transactions with same amount and similar description
  // grouped by month. For now, we'll just return a mock or simple grouping.
  // Real implementation would require more complex pattern matching.
  
  const recurring: { name: string; amount: number; frequency: string }[] = [];
  
  // Mock detection for common subscriptions based on names
  const subscriptionKeywords = ['netflix', 'spotify', 'youtube', 'prime', 'apple', 'gym', 'internet', 'wifi', 'broadband'];
  
  const potentialSubs = transactions.filter(t => 
    t.type === 'expense' && 
    subscriptionKeywords.some(k => t.category.toLowerCase().includes(k) || (t.note && t.note.toLowerCase().includes(k)))
  );

  // Deduplicate by name/category
  const uniqueSubs = new Set();
  potentialSubs.forEach(sub => {
    const key = sub.category; // or note
    if (!uniqueSubs.has(key)) {
      uniqueSubs.add(key);
      recurring.push({
        name: sub.category, // or note if available and better
        amount: sub.amount,
        frequency: 'Monthly'
      });
    }
  });

  return recurring;
};

export const generateInsights = (transactions: Transaction[]) => {
  const insights: string[] = [];
  
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

  if (totalExpense > totalIncome && totalIncome > 0) {
    insights.push(`You've spent ${Math.round((totalExpense / totalIncome) * 100)}% of your income.`);
  }

  // Check for high spending on weekends
  const weekendSpend = expenses.filter(t => {
    const day = new Date(t.date).getDay();
    return day === 0 || day === 6;
  }).reduce((sum, t) => sum + t.amount, 0);

  if (weekendSpend > totalExpense * 0.4) {
    insights.push('Your weekend spending is high (over 40% of total).');
  }

  return insights;
};
