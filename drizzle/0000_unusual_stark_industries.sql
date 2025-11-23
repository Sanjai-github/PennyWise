CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`created_at` integer DEFAULT '"2025-11-23T11:20:52.015Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` integer NOT NULL,
	`amount` real NOT NULL,
	`date` integer NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`note` text,
	`created_at` integer DEFAULT '"2025-11-23T11:20:52.015Z"' NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
