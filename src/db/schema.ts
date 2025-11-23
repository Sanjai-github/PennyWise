import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['cash', 'bank', 'card', 'wallet'] }).notNull(),
  balance: real('balance').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id').references(() => accounts.id).notNull(),
  amount: real('amount').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  category: text('category').notNull(),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
