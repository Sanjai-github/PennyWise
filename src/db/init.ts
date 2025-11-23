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
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};
