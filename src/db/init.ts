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
        // Goal Fund
        { name: 'Goal Fund', type: 'expense', icon: 'Target', color: '#FF9800', isDefault: true },
      ];

      defaultCategories.forEach(cat => {
        db.runSync(
          'INSERT INTO categories (name, type, icon, color, is_custom) VALUES (?, ?, ?, ?, ?)',
          [cat.name, cat.type, cat.icon, cat.color, 0]
        );
      });
      console.log('Seeded default categories');
    }

    // Migration for profile_image column in users table
    try {
      const result = db.getAllSync('SELECT count(*) as count FROM pragma_table_info("users") WHERE name="profile_image"');
      // @ts-ignore
      if (result[0].count === 0) {
        db.runSync('ALTER TABLE users ADD COLUMN profile_image TEXT');
        console.log('Added profile_image column to users table');
      }
    } catch (e) {
      console.log('Profile image column check failed or already exists');
    }

    // Migration for created_at column in accounts table
    try {
      const result = db.getAllSync('SELECT count(*) as count FROM pragma_table_info("accounts") WHERE name="created_at"');
      // @ts-ignore
      if (result[0].count === 0) {
        db.runSync('ALTER TABLE accounts ADD COLUMN created_at INTEGER DEFAULT (unixepoch()) NOT NULL');
        console.log('Added created_at column to accounts table');
      }
    } catch (e) {
      console.log('Created_at column check failed or already exists');
    }

    // Migration for is_custom column in categories table
    try {
      const result = db.getAllSync('SELECT count(*) as count FROM pragma_table_info("categories") WHERE name="is_custom"');
      // @ts-ignore
      if (result[0].count === 0) {
        db.runSync('ALTER TABLE categories ADD COLUMN is_custom INTEGER DEFAULT 0 NOT NULL');
        console.log('Added is_custom column to categories table');
      }
    } catch (e) {
      console.log('is_custom column check failed or already exists');
    }

    // Migration for rollover_enabled column in budgets table
    try {
      const result = db.getAllSync('SELECT count(*) as count FROM pragma_table_info("budgets") WHERE name="rollover_enabled"');
      // @ts-ignore
      if (result[0].count === 0) {
        db.runSync('ALTER TABLE budgets ADD COLUMN rollover_enabled INTEGER DEFAULT 0 NOT NULL');
        console.log('Added rollover_enabled column to budgets table');
      }
    } catch (e) {
      console.log('rollover_enabled column check failed or already exists');
    }

    // Create Goals Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS goals (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        target_amount real NOT NULL,
        current_amount real DEFAULT 0 NOT NULL,
        deadline integer,
        icon text NOT NULL,
        color text NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL
      );
    `);

    // Create Goals Wallet Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS goals_wallet (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        balance real DEFAULT 0 NOT NULL,
        updated_at integer DEFAULT (unixepoch()) NOT NULL
      );
    `);

    // Initialize Wallet if empty
    const walletResult = db.getAllSync('SELECT count(*) as count FROM goals_wallet');
    // @ts-ignore
    if (walletResult[0].count === 0) {
      db.runSync('INSERT INTO goals_wallet (balance) VALUES (0)');
      console.log('Initialized Goals Wallet');
    }

  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};
