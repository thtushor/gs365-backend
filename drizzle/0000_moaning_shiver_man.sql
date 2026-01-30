CREATE TABLE `countries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`flag_url` text,
	`country_code` varchar(50),
	`currency_id` int,
	`status` enum('active','inactive') DEFAULT 'active',
	CONSTRAINT `countries_id` PRIMARY KEY(`id`),
	CONSTRAINT `countries_country_code_unique` UNIQUE(`country_code`)
);
--> statement-breakpoint
CREATE TABLE `currencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`symbol` varchar(5),
	`symbol_native` varchar(5),
	`name` varchar(50),
	`status` enum('active','inactive') DEFAULT 'active',
	CONSTRAINT `currencies_id` PRIMARY KEY(`id`),
	CONSTRAINT `currencies_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `languages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(10),
	`name` varchar(100) NOT NULL,
	`status` enum('active','inactive') DEFAULT 'active',
	CONSTRAINT `languages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `country_languages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`country_id` int NOT NULL,
	`language_id` int NOT NULL,
	`status` enum('active','inactive') DEFAULT 'active',
	CONSTRAINT `country_languages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50),
	`fullname` varchar(100),
	`phone` varchar(20),
	`email` varchar(255),
	`password` varchar(255),
	`currency_id` int,
	`country_id` int,
	`refer_code` varchar(50),
	`created_by` int,
	`status` enum('active','inactive'),
	`isAgreeWithTerms` boolean,
	`is_logged_in` boolean DEFAULT false,
	`is_verified` boolean DEFAULT false,
	`last_ip` varchar(120),
	`last_login` datetime,
	`token_version` int DEFAULT 0,
	`device_type` varchar(50),
	`device_name` varchar(100),
	`os_version` varchar(50),
	`browser` varchar(50),
	`browser_version` varchar(50),
	`ip_address` varchar(45),
	`device_token` text,
	`referred_by` int,
	`referred_by_admin_user` int,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`kyc_status` enum('verified','unverified','required','pending') DEFAULT 'unverified',
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_phone_unique` UNIQUE(`phone`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50),
	`fullname` varchar(100),
	`phone` varchar(20),
	`email` varchar(255),
	`password` varchar(255),
	`country` varchar(255),
	`city` varchar(255),
	`street` varchar(255),
	`remaining_balance` decimal(20,2),
	`minimum_trx` decimal,
	`maximum_trx` decimal,
	`currency` int,
	`admin_designation` int,
	`role` enum('superAdmin','admin','superAgent','agent','superAffiliate','affiliate'),
	`status` enum('active','inactive') DEFAULT 'inactive',
	`ref_code` varchar(255),
	`is_logged_in` boolean DEFAULT false,
	`is_verified` boolean DEFAULT false,
	`last_ip` varchar(120),
	`last_login` datetime,
	`commission_percent` int,
	`main_balance` int DEFAULT 0,
	`downline_balance` int DEFAULT 0,
	`withdrawable_balance` int DEFAULT 0,
	`device_type` varchar(50),
	`device_name` varchar(100),
	`os_version` varchar(50),
	`browser` varchar(50),
	`browser_version` varchar(50),
	`ip_address` varchar(45),
	`device_token` text,
	`created_by` int,
	`referred_by` int,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`kyc_status` enum('verified','unverified','required','pending') DEFAULT 'unverified',
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_username_unique` UNIQUE(`username`),
	CONSTRAINT `admin_users_phone_unique` UNIQUE(`phone`),
	CONSTRAINT `admin_users_email_unique` UNIQUE(`email`),
	CONSTRAINT `admin_users_ref_code_unique` UNIQUE(`ref_code`)
);
--> statement-breakpoint
CREATE TABLE `dropdown_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`dropdown_id` int NOT NULL,
	`img_url` text,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`created_by` varchar(200) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`is_menu` boolean DEFAULT false,
	`menu_priority` int DEFAULT 0,
	CONSTRAINT `dropdown_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dropdowns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `dropdowns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promotion_name` varchar(300) NOT NULL,
	`promotion_type_id` json NOT NULL,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`date_range` varchar(255) NOT NULL,
	`minimum_deposit_amount` decimal(20,2) NOT NULL,
	`maximum_deposit_amount` decimal(20,2) NOT NULL,
	`turnover_multiply` int NOT NULL,
	`banner_img` text NOT NULL,
	`bonus` int NOT NULL,
	`description` text NOT NULL,
	`is_recommended` boolean DEFAULT false,
	`created_by` varchar(200) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotions_promotion_name_unique` UNIQUE(`promotion_name`)
);
--> statement-breakpoint
CREATE TABLE `ambassadors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`photo` varchar(500) NOT NULL,
	`signature` varchar(255) NOT NULL,
	`description` varchar(3000),
	`duration` varchar(255) NOT NULL,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `ambassadors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(1500) NOT NULL,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`date_range` varchar(255),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hero_banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date_range` varchar(255),
	`status` enum('active','inactive') DEFAULT 'inactive',
	`banner_images` text NOT NULL,
	`title` varchar(255) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `hero_banners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`banner_images` text NOT NULL,
	`title` varchar(255) NOT NULL,
	`sport_id` int NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dropdown_option_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` varchar(3000) NOT NULL,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `featured_games` (
	`id` int NOT NULL DEFAULT 1,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`banner_images` text NOT NULL,
	`title` varchar(255) NOT NULL,
	`game_id` int NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `featured_games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gaming_licenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`icon` varchar(500) NOT NULL,
	`duration` varchar(255),
	`status` enum('active','inactive') DEFAULT 'inactive',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `gaming_licenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `responsible_gaming` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`icon` varchar(500) NOT NULL,
	`duration` varchar(255),
	`status` enum('active','inactive') DEFAULT 'inactive',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `responsible_gaming_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`banner_images` text NOT NULL,
	`title` varchar(255) NOT NULL,
	`link` varchar(255) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `socials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sponsors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`logo` varchar(500) NOT NULL,
	`company_type` varchar(255) NOT NULL,
	`description` varchar(3000),
	`duration` varchar(255) NOT NULL,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sponsors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_advertisement` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(3000),
	`video_url` varchar(500) NOT NULL,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`date_range` varchar(255),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `video_advertisement_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `website_popups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` varchar(3000) NOT NULL,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`date_range` varchar(255),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `website_popups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100),
	`status` enum('active','inactive') DEFAULT 'active',
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_methods_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100),
	`payment_method_id` int NOT NULL,
	`status` enum('active','inactive') DEFAULT 'active',
	CONSTRAINT `payment_methods_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_methods_types_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `payment_gateway` (
	`id` int AUTO_INCREMENT NOT NULL,
	`method_id` int NOT NULL,
	`payment_method_type_ids` json NOT NULL,
	`icon_url` varchar(255),
	`min_deposit` double,
	`max_deposit` double,
	`min_withdraw` double,
	`max_withdraw` double,
	`bonus` double,
	`status` enum('active','inactive') DEFAULT 'active',
	`country_code` int,
	`network` varchar(100),
	`currency_conversion_rate` double,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `payment_gateway_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_gateway_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `payment_provider` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`contact_info` text,
	`commission_percentage` int DEFAULT 0,
	`status` enum('active','inactive') DEFAULT 'active',
	CONSTRAINT `payment_provider_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_provider_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `payment_gateway_providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gateway_id` int NOT NULL,
	`provider_id` int NOT NULL,
	`license_key` text,
	`commission` double,
	`is_recommended` boolean,
	`priority` int,
	`status` enum('active','inactive') DEFAULT 'active',
	CONSTRAINT `payment_gateway_providers_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_gateway_provider` UNIQUE(`gateway_id`,`provider_id`)
);
--> statement-breakpoint
CREATE TABLE `game_providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(300) NOT NULL,
	`parent_id` int,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`min_balance_limit` decimal(20,2) NOT NULL,
	`main_balance` decimal(20,2) NOT NULL DEFAULT '0',
	`total_expense` decimal(20,2) NOT NULL DEFAULT '0',
	`provider_ip` text NOT NULL,
	`license_key` text NOT NULL,
	`phone` varchar(200) NOT NULL,
	`email` varchar(250) NOT NULL,
	`whatsapp` varchar(200),
	`parent_name` varchar(200),
	`telegram` varchar(200),
	`country` varchar(200) NOT NULL,
	`logo` text NOT NULL,
	`is_menu` boolean DEFAULT false,
	`menu_priority` int DEFAULT 0,
	`icon` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `game_providers_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_providers_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(300) NOT NULL,
	`parent_id` int,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`is_favorite` boolean DEFAULT false,
	`is_exclusive` boolean DEFAULT false,
	`api_key` text NOT NULL,
	`license_key` text NOT NULL,
	`game_logo` text NOT NULL,
	`secret_pin` varchar(150) NOT NULL,
	`game_url` varchar(300) NOT NULL,
	`ggr_percent` varchar(100) NOT NULL,
	`category_id` int,
	`provider_id` int,
	`created_by` varchar(200),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `games_id` PRIMARY KEY(`id`),
	CONSTRAINT `games_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `sports_providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(300) NOT NULL,
	`parent_id` int,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`min_balance_limit` decimal(20,2) NOT NULL,
	`main_balance` decimal(20,2) NOT NULL DEFAULT '0',
	`total_expense` decimal(20,2) NOT NULL DEFAULT '0',
	`provider_ip` text NOT NULL,
	`license_key` text NOT NULL,
	`phone` varchar(200) NOT NULL,
	`email` varchar(250) NOT NULL,
	`whatsapp` varchar(200),
	`parent_name` varchar(200),
	`telegram` varchar(200),
	`country` varchar(200) NOT NULL,
	`logo` text NOT NULL,
	`is_menu` boolean DEFAULT false,
	`menu_priority` int DEFAULT 0,
	`icon` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sports_providers_id` PRIMARY KEY(`id`),
	CONSTRAINT `sports_providers_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `sports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(300) NOT NULL,
	`parent_id` int,
	`status` enum('active','inactive') DEFAULT 'inactive',
	`is_favorite` boolean DEFAULT false,
	`is_exclusive` boolean DEFAULT false,
	`api_key` text NOT NULL,
	`license_key` text NOT NULL,
	`sport_logo` text NOT NULL,
	`secret_pin` varchar(150) NOT NULL,
	`sport_url` varchar(300) NOT NULL,
	`ggr_percent` varchar(100) NOT NULL,
	`category_id` int,
	`provider_id` int,
	`created_by` varchar(200),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sports_id` PRIMARY KEY(`id`),
	CONSTRAINT `sports_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `gateway_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider_id` int NOT NULL,
	`account_number` varchar(100),
	`holder_name` varchar(100),
	`provider` varchar(100),
	`bank_name` varchar(100),
	`branch_name` varchar(100),
	`branch_address` varchar(255),
	`swift_code` varchar(50),
	`iban` varchar(100),
	`wallet_address` text,
	`network` varchar(50),
	`is_primary` boolean DEFAULT false,
	`is_verified` boolean DEFAULT false,
	`status` enum('active','inactive') DEFAULT 'active',
	CONSTRAINT `gateway_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`affiliate_id` int,
	`transaction_type` enum('deposit','withdraw','win','loss') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`bonus_amount` decimal(10,2) DEFAULT '0',
	`conversion_rate` decimal DEFAULT '100',
	`currency_id` int NOT NULL,
	`promotion_id` int,
	`game_id` int,
	`transaction_status` enum('approved','pending','rejected') DEFAULT 'pending',
	`custom_transaction_id` varchar(100),
	`given_transaction_id` varchar(100),
	`attachment` text,
	`notes` text,
	`provider_account_id` int,
	`gateWayId` int,
	`account_number` varchar(100),
	`account_holder_name` varchar(100),
	`bank_name` varchar(100),
	`branch_name` varchar(100),
	`branch_address` varchar(255),
	`swift_code` varchar(50),
	`iban` varchar(100),
	`wallet_address` text,
	`network` varchar(50),
	`processed_by` int,
	`processedByUser` int,
	`processed_at` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_custom_transaction_id_unique` UNIQUE(`custom_transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `turnover` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`transaction_id` int,
	`turnover_type` enum('default','promotion') DEFAULT 'default',
	`turnover_status` enum('active','inactive','completed') DEFAULT 'active',
	`turnover_name` varchar(300) NOT NULL,
	`deposit_amount` decimal(20,2),
	`target_turnover` decimal(20,2) NOT NULL,
	`remaining_turnover` decimal(20,2) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `turnover_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`default_turnover` int NOT NULL,
	`adminBalance` decimal NOT NULL,
	`min_withdrawable_balance` decimal DEFAULT '25000',
	`conversion_rate` decimal DEFAULT '100',
	`affiliate_withdraw_time` json,
	`system_active_time` json,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bet_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`game_id` int NOT NULL,
	`bet_balance` decimal(20,2) DEFAULT '0',
	`bet_amount` decimal(20,2) DEFAULT '0',
	`bet_status` enum('win','loss','pending','cancelled') DEFAULT 'pending',
	`playing_status` enum('playing','completed','abandoned') DEFAULT 'playing',
	`session_token` text DEFAULT (''),
	`game_session_id` text DEFAULT (''),
	`win_amount` decimal(20,2) DEFAULT '0',
	`loss_amount` decimal(20,2) DEFAULT '0',
	`multiplier` decimal(10,4) DEFAULT '0.0000',
	`game_name` text DEFAULT (''),
	`game_provider` text DEFAULT (''),
	`game_category` text DEFAULT (''),
	`user_score` int DEFAULT 0,
	`user_level` varchar(50) DEFAULT 'beginner',
	`bet_placed_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`game_started_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`game_completed_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`ip_address` varchar(45) DEFAULT '',
	`device_info` text DEFAULT (''),
	`is_mobile` boolean DEFAULT false,
	`created_by` varchar(200),
	`updated_by` varchar(200),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bet_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commission` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bet_result_id` int NOT NULL,
	`player_id` int NOT NULL,
	`admin_user_id` int NOT NULL,
	`commission_amount` decimal(20,2) DEFAULT '0',
	`percentage` decimal(5,2) DEFAULT '0',
	`status` enum('pending','approved','rejected','paid','settled') DEFAULT 'pending',
	`notes` varchar(500),
	`created_by` varchar(200),
	`updated_by` varchar(200),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commission_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_login_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`ip_address` varchar(45) NOT NULL,
	`user_agent` text,
	`login_time` datetime DEFAULT CURRENT_TIMESTAMP,
	`device_type` varchar(50),
	`device_name` varchar(100),
	`os_version` varchar(50),
	`browser` varchar(50),
	`browser_version` varchar(50),
	CONSTRAINT `user_login_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kyc` (
	`id` int AUTO_INCREMENT NOT NULL,
	`document_type` varchar(150) NOT NULL,
	`full_name` varchar(150) NOT NULL,
	`document_no` varchar(150) NOT NULL,
	`expiry_date` varchar(150) NOT NULL,
	`dob` varchar(150) NOT NULL,
	`document_front` varchar(500) NOT NULL,
	`document_back` varchar(500) NOT NULL,
	`selfie` varchar(500) NOT NULL,
	`holder_id` int NOT NULL,
	`holder_type` enum('player','affiliate','agent') NOT NULL,
	`status` enum('approved','rejected','pending') DEFAULT 'pending',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kyc_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `withdrawal_payment_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`gateway_id` int,
	`account_number` varchar(100),
	`holder_name` varchar(100),
	`provider` varchar(100),
	`bank_name` varchar(100),
	`branch_name` varchar(100),
	`branch_address` varchar(255),
	`swift_code` varchar(50),
	`iban` varchar(100),
	`routing_number` varchar(50),
	`wallet_address` text,
	`network` varchar(50),
	`account_holder_phone` varchar(50),
	`account_holder_email` varchar(255),
	`country` varchar(100),
	`state` varchar(100),
	`city` varchar(100),
	`address` text,
	`postal_code` varchar(20),
	`is_primary` boolean DEFAULT false,
	`is_verified` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`verification_status` varchar(50) DEFAULT 'pending',
	`verification_notes` text,
	`min_withdrawal_amount` varchar(50),
	`max_withdrawal_amount` varchar(50),
	`withdrawal_fee` varchar(50),
	`processing_time` varchar(100),
	`additional_info` text,
	`created_by` varchar(100),
	`updated_by` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `withdrawal_payment_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_main_balance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`amount` decimal(20,2) NOT NULL,
	`admin_main_balance_type` enum('admin_deposit','player_deposit','promotion','player_withdraw','admin_withdraw') NOT NULL,
	`admin_main_balance_status` enum('approved','pending','rejected') DEFAULT 'pending',
	`promotion_id` int,
	`transaction_id` int,
	`promotion_name` varchar(300),
	`currency_id` int,
	`created_by_player` int,
	`created_by_admin` int,
	`notes` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_main_balance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`game_id` int NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `user_favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `currency_conversion` (
	`id` int AUTO_INCREMENT NOT NULL,
	`from_currency` int NOT NULL,
	`to_currency` int NOT NULL,
	`rate` decimal(10,2) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `currency_conversion_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `designation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`designation_name` varchar(200) NOT NULL,
	`role` enum('superAdmin','admin','superAgent','agent','superAffiliate','affiliate'),
	`permissions` json NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `designation_id` PRIMARY KEY(`id`),
	CONSTRAINT `designation_designation_name_unique` UNIQUE(`designation_name`)
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`admin_user_id` int,
	`guestId` varchar(300),
	`chat_status` enum('open','closed','pending_admin_response','pending_user_response') DEFAULT 'open',
	`chat_type` enum('user','admin','guest') DEFAULT 'user',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chat_id` int NOT NULL,
	`sender_id` int,
	`guest_sender_id` varchar(300),
	`message_sender_type` enum('user','admin','guest','system') NOT NULL,
	`message_type` enum('text','image','file') DEFAULT 'text',
	`content` text NOT NULL,
	`attachment_url` varchar(500),
	`is_read` boolean DEFAULT false,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auto_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyword` varchar(255) NOT NULL,
	`reply_message` text NOT NULL,
	`is_active` boolean DEFAULT true,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auto_replies_id` PRIMARY KEY(`id`),
	CONSTRAINT `auto_replies_keyword_unique` UNIQUE(`keyword`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notification_type` enum('claimable','linkable','static','admin_player_transaction','admin_affiliate_transaction','admin_player_kyc','admin_affiliate_kyc','admin_others') NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`poster_img` text,
	`amount` decimal(20,2),
	`turnover_multiply` int,
	`player_ids` text,
	`promotion_id` int,
	`link` varchar(500),
	`start_date` datetime NOT NULL,
	`end_date` datetime NOT NULL,
	`status` enum('active','inactive','claimed','expired') DEFAULT 'active',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` int NOT NULL,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`admin_id` int,
	`token` text NOT NULL,
	`token_type` enum('verify','reset_password','2fa'),
	`is_used` boolean DEFAULT false,
	`expires_at` datetime NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `user_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_phones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`phone_number` varchar(32) NOT NULL,
	`is_primary` boolean DEFAULT false,
	`is_verified` boolean DEFAULT false,
	`is_sms_capable` boolean DEFAULT true,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_phones_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_phones_phone_number_unique` UNIQUE(`phone_number`)
);
--> statement-breakpoint
ALTER TABLE `payment_gateway_providers` ADD CONSTRAINT `payment_gateway_providers_gateway_id_payment_gateway_id_fk` FOREIGN KEY (`gateway_id`) REFERENCES `payment_gateway`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_gateway_providers` ADD CONSTRAINT `payment_gateway_providers_provider_id_payment_provider_id_fk` FOREIGN KEY (`provider_id`) REFERENCES `payment_provider`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gateway_accounts` ADD CONSTRAINT `gateway_accounts_provider_id_payment_gateway_providers_id_fk` FOREIGN KEY (`provider_id`) REFERENCES `payment_gateway_providers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_affiliate_id_admin_users_id_fk` FOREIGN KEY (`affiliate_id`) REFERENCES `admin_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_currency_id_currencies_id_fk` FOREIGN KEY (`currency_id`) REFERENCES `currencies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_promotion_id_promotions_id_fk` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_game_id_games_id_fk` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_provider_account_id_gateway_accounts_id_fk` FOREIGN KEY (`provider_account_id`) REFERENCES `gateway_accounts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_gateWayId_payment_gateway_id_fk` FOREIGN KEY (`gateWayId`) REFERENCES `payment_gateway`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `turnover` ADD CONSTRAINT `turnover_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `turnover` ADD CONSTRAINT `turnover_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_login_history` ADD CONSTRAINT `user_login_history_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `withdrawal_payment_accounts` ADD CONSTRAINT `withdrawal_payment_accounts_gateway_id_payment_gateway_id_fk` FOREIGN KEY (`gateway_id`) REFERENCES `payment_gateway`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_main_balance` ADD CONSTRAINT `admin_main_balance_promotion_id_promotions_id_fk` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_main_balance` ADD CONSTRAINT `admin_main_balance_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_main_balance` ADD CONSTRAINT `admin_main_balance_currency_id_currencies_id_fk` FOREIGN KEY (`currency_id`) REFERENCES `currencies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_main_balance` ADD CONSTRAINT `admin_main_balance_created_by_player_users_id_fk` FOREIGN KEY (`created_by_player`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_main_balance` ADD CONSTRAINT `admin_main_balance_created_by_admin_admin_users_id_fk` FOREIGN KEY (`created_by_admin`) REFERENCES `admin_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chats` ADD CONSTRAINT `chats_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chats` ADD CONSTRAINT `chats_admin_user_id_admin_users_id_fk` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_chat_id_chats_id_fk` FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_phones` ADD CONSTRAINT `user_phones_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `withdrawal_payment_accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `payment_gateway_id_idx` ON `withdrawal_payment_accounts` (`gateway_id`);--> statement-breakpoint
CREATE INDEX `is_active_idx` ON `withdrawal_payment_accounts` (`is_active`);--> statement-breakpoint
CREATE INDEX `verification_status_idx` ON `withdrawal_payment_accounts` (`verification_status`);--> statement-breakpoint
CREATE INDEX `is_primary_idx` ON `withdrawal_payment_accounts` (`is_primary`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `user_phones` (`user_id`);--> statement-breakpoint
CREATE INDEX `is_primary_idx` ON `user_phones` (`is_primary`);