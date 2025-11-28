import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('pennywise.db');

export const initDatabase = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        type text NOT NULL,
        balance real DEFAULT 0 NOT NULL,
        currency text DEFAULT 'USD' NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        account_id integer NOT NULL,
        amount real NOT NULL,
        date integer NOT NULL,
        type text NOT NULL,
        category text NOT NULL,
        note text,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE no action ON DELETE no action
      );

      CREATE TABLE IF NOT EXISTS users (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        email text NOT NULL UNIQUE,
        password text NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        type text NOT NULL,
        icon text NOT NULL,
        color text NOT NULL,
        is_custom integer DEFAULT 0 NOT NULL
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        category text NOT NULL,
        amount real NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL
      );
    `);
    console.log('Database initialized successfully');

    // Seed default categories if empty
    const result = db.getAllSync('SELECT count(*) as count FROM categories');
    // @ts-ignore
    if (result[0].count === 0) {
      const defaultCategories = [
        // Expense
        { name: 'Food', type: 'expense', icon: 'Coffee', color: '#FF6384' },
        { name: 'Transport', type: 'expense', icon: 'Car', color: '#36A2EB' },
        { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#FFCE56' },
        { name: 'Housing', type: 'expense', icon: 'Home', color: '#4BC0C0' },
        { name: 'Health', type: 'expense', icon: 'Heart', color: '#FF9F40' },
        { name: 'Other', type: 'expense', icon: 'DollarSign', color: '#9966FF' },
        // Income
        { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#4CAF50' },
        { name: 'Freelance', type: 'income', icon: 'Briefcase', color: '#8BC34A' },
        { name: 'Gift', type: 'income', icon: 'Gift', color: '#CDDC39' },
        { name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#FFC107' },
        { name: 'Other', type: 'income', icon: 'DollarSign', color: '#FF9800' },
      ];

      defaultCategories.forEach(cat => {
        db.runSync(
          'INSERT INTO categories (name, type, icon, color, is_custom) VALUES (?, ?, ?, ?, ?)',
          [cat.name, cat.type, cat.icon, cat.color, 0]
        );
      });
      console.log('Seeded default categories');
    }

    // Migration: Add category column if it doesn't exist (for existing installs)
    try {
      db.execSync(`ALTER TABLE transactions ADD COLUMN category text NOT NULL DEFAULT 'General'`);
      console.log('Added category column to transactions');
    } catch (e) {
      // Column likely already exists, ignore
    }

    try {
      db.execSync(`ALTER TABLE transactions ADD COLUMN created_at integer DEFAULT (unixepoch()) NOT NULL`);
      console.log('Added created_at column to transactions');
    } catch (e) {
      // Column likely already exists, ignore
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};
