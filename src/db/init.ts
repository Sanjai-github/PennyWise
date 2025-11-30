import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('pennywise.db');

export const initDatabase = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id integer NOT NULL,
        name text NOT NULL,
        type text NOT NULL,
        balance real DEFAULT 0 NOT NULL,
        currency text DEFAULT 'USD' NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id integer NOT NULL,
        account_id integer NOT NULL,
        amount real NOT NULL,
        date integer NOT NULL,
        type text NOT NULL,
        category text NOT NULL,
        note text,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE no action ON DELETE no action
      );

      CREATE TABLE IF NOT EXISTS users (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        email text NOT NULL UNIQUE,
        password text NOT NULL,
        profile_image text,
        created_at integer DEFAULT (unixepoch()) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id integer,
        name text NOT NULL,
        type text NOT NULL,
        icon text NOT NULL,
        color text NOT NULL,
        is_custom integer DEFAULT 0 NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id integer NOT NULL,
        category text NOT NULL,
        amount real NOT NULL,
        rollover_enabled integer DEFAULT 0 NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
      );

      CREATE TABLE IF NOT EXISTS goals (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id integer NOT NULL,
        name text NOT NULL,
        target_amount real NOT NULL,
        current_amount real DEFAULT 0 NOT NULL,
        deadline integer,
        icon text NOT NULL,
        color text NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
      );

      CREATE TABLE IF NOT EXISTS goals_wallet (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id integer NOT NULL,
        balance real DEFAULT 0 NOT NULL,
        updated_at integer DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
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

    // Migration helper
    const addColumnIfNotExists = (table: string, column: string, definition: string) => {
      try {
        const result = db.getAllSync(`SELECT count(*) as count FROM pragma_table_info("${table}") WHERE name="${column}"`);
        // @ts-ignore
        if (result[0].count === 0) {
          db.runSync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
          console.log(`Added ${column} column to ${table} table`);
        }
      } catch (e) {
        console.log(`${column} column check failed or already exists in ${table}`);
      }
    };

    // Run Migrations
    addColumnIfNotExists('users', 'profile_image', 'TEXT');
    addColumnIfNotExists('accounts', 'created_at', 'INTEGER DEFAULT (unixepoch()) NOT NULL');
    addColumnIfNotExists('categories', 'is_custom', 'INTEGER DEFAULT 0 NOT NULL');
    addColumnIfNotExists('budgets', 'rollover_enabled', 'INTEGER DEFAULT 0 NOT NULL');
    
    // Add user_id to all tables
    // Note: For existing data, we might need to assign it to a default user or handle it. 
    // Here we just add the column, it will be NULL for existing rows unless we set a default.
    // We'll make it nullable initially for migration, or default to 0/1 if we assume single user previously.
    // For strictness, let's add it as INTEGER first.
    
    // We will attempt to update existing rows to user_id = 1 (assuming the first user is the owner of existing data)
    // This is a heuristic for single-device, single-user-at-a-time apps transitioning to multi-user.
    
    const tablesWithUser = ['accounts', 'transactions', 'budgets', 'goals', 'goals_wallet'];
    tablesWithUser.forEach(table => {
      addColumnIfNotExists(table, 'user_id', 'INTEGER');
      // Try to backfill user_id = 1 for nulls
      try {
        db.runSync(`UPDATE ${table} SET user_id = 1 WHERE user_id IS NULL`);
      } catch (e) {
        // Ignore
      }
    });
    
    // Categories is special, user_id can be null for defaults.
    addColumnIfNotExists('categories', 'user_id', 'INTEGER');

  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};
