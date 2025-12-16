CREATE TABLE `users` (
	`user_id` varchar(191) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`token_hash` varchar(255) NOT NULL,
	`token_jti` varchar(64) NOT NULL,
	`expires_at` datetime NOT NULL,
	`revoked` boolean NOT NULL DEFAULT false,
	`revoked_at` datetime,
	`replaced_by` varchar(64),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `refresh_tokens_token_jti_unique` UNIQUE(`token_jti`)
);
--> statement-breakpoint
CREATE TABLE `blocked_tokens` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`token_jti` varchar(64) NOT NULL,
	`user_id` varchar(191),
	`expires_at` datetime,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `blocked_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `blocked_tokens_token_jti_unique` UNIQUE(`token_jti`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`stored_name` varchar(255) NOT NULL,
	`extension` varchar(50),
	`mime_type` varchar(100),
	`size` bigint,
	`uploaded_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blocked_tokens` ADD CONSTRAINT `blocked_tokens_user_id_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `files` ADD CONSTRAINT `files_user_id_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE no action;