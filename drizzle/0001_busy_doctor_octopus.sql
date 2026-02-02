CREATE TABLE `spin_bonus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`amount` decimal(18,2) NOT NULL,
	`conversion_rate` decimal DEFAULT '100',
	`transaction_id` int,
	`turnover_multiply` decimal(10,2) NOT NULL DEFAULT '1.00',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `spin_bonus_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `transaction_type` enum('deposit','withdraw','win','loss','spin_bonus') NOT NULL;--> statement-breakpoint
ALTER TABLE `turnover` MODIFY COLUMN `turnover_type` enum('default','promotion','spin_bonus') DEFAULT 'default';--> statement-breakpoint
ALTER TABLE `admin_main_balance` MODIFY COLUMN `admin_main_balance_type` enum('admin_deposit','player_deposit','promotion','spin_bonus','player_withdraw','admin_withdraw') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `otp` varchar(6);--> statement-breakpoint
ALTER TABLE `users` ADD `otp_expiry` datetime;--> statement-breakpoint
ALTER TABLE `users` ADD `reset_password_token` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `reset_password_token_expiry` datetime;--> statement-breakpoint
ALTER TABLE `users` ADD `is_daily_spin_completed` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `is_spin_forced_by_admin` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `is_forced_spin_complete` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `last_spin_date` datetime;--> statement-breakpoint
ALTER TABLE `admin_users` ADD `otp` varchar(6);--> statement-breakpoint
ALTER TABLE `admin_users` ADD `otp_expiry` datetime;--> statement-breakpoint
ALTER TABLE `admin_users` ADD `reset_password_token` varchar(255);--> statement-breakpoint
ALTER TABLE `admin_users` ADD `reset_password_token_expiry` datetime;--> statement-breakpoint
ALTER TABLE `settings` ADD `spin_turnover_multiply` decimal DEFAULT '10';--> statement-breakpoint
ALTER TABLE `settings` ADD `is_global_spin_enabled` enum('Enabled','Disabled') DEFAULT 'Enabled';--> statement-breakpoint
ALTER TABLE `user_phones` ADD `otp` varchar(6);--> statement-breakpoint
ALTER TABLE `user_phones` ADD `otp_expiry` datetime;--> statement-breakpoint
ALTER TABLE `spin_bonus` ADD CONSTRAINT `spin_bonus_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `spin_bonus` ADD CONSTRAINT `spin_bonus_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE set null ON UPDATE no action;