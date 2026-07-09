CREATE TABLE `bad_solutions` (
	`id` text PRIMARY KEY NOT NULL,
	`problem_id` text NOT NULL,
	`language` text NOT NULL,
	`label` text NOT NULL,
	`code` text NOT NULL,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bad_solutions_problem_id_language_unique` ON `bad_solutions` (`problem_id`,`language`);--> statement-breakpoint
CREATE TABLE `checkpoint_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`checkpoint_question_id` text NOT NULL,
	`is_correct` integer NOT NULL,
	`attempt_count` integer DEFAULT 1 NOT NULL,
	`answered_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`checkpoint_question_id`) REFERENCES `checkpoint_questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checkpoint_answers_user_id_checkpoint_question_id_unique` ON `checkpoint_answers` (`user_id`,`checkpoint_question_id`);--> statement-breakpoint
CREATE TABLE `checkpoint_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`problem_id` text NOT NULL,
	`screen` text NOT NULL,
	`position` integer NOT NULL,
	`question_md` text NOT NULL,
	`choices_json` text NOT NULL,
	`correct_choice_index` integer NOT NULL,
	`explanation_md` text,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `code_reading_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short` text,
	`body_md` text NOT NULL,
	`python_code` text,
	`other_note` text
);
--> statement-breakpoint
CREATE TABLE `explanation_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`problem_id` text NOT NULL,
	`screen` text NOT NULL,
	`position` integer NOT NULL,
	`title` text,
	`body_md` text NOT NULL,
	`variant` text,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `glossary_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short` text,
	`description_md` text NOT NULL,
	`without_label` text,
	`without_code` text,
	`with_label` text,
	`with_code` text,
	`when_to_use_md` text
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon_key` text NOT NULL,
	`slot` text,
	`price_coins` integer,
	`is_key` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `problem_glossary_links` (
	`problem_id` text NOT NULL,
	`glossary_id` text NOT NULL,
	PRIMARY KEY(`problem_id`, `glossary_id`),
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`glossary_id`) REFERENCES `glossary_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `problem_tags` (
	`problem_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`problem_id`, `tag_id`),
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `problems` (
	`id` text PRIMARY KEY NOT NULL,
	`contest` text NOT NULL,
	`problem_number` text NOT NULL,
	`title` text NOT NULL,
	`atcoder_url` text NOT NULL,
	`difficulty` integer NOT NULL,
	`required_level` integer DEFAULT 1 NOT NULL,
	`statement_md` text NOT NULL,
	`constraints_md` text NOT NULL,
	`constraints_note_md` text,
	`statement_note_md` text,
	`map_x` integer,
	`map_y` integer,
	`map_order` integer,
	`clear_reward_item_id` text,
	`is_published` integer DEFAULT false NOT NULL,
	`added_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`clear_reward_item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`problem_id` text NOT NULL,
	`screen` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`completed_at` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `progress_user_id_problem_id_screen_unique` ON `progress` (`user_id`,`problem_id`,`screen`);--> statement-breakpoint
CREATE TABLE `samples` (
	`id` text PRIMARY KEY NOT NULL,
	`problem_id` text NOT NULL,
	`position` integer NOT NULL,
	`input` text NOT NULL,
	`output` text NOT NULL,
	`explanation_md` text,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `solutions` (
	`id` text PRIMARY KEY NOT NULL,
	`problem_id` text NOT NULL,
	`language` text NOT NULL,
	`code` text NOT NULL,
	`steps_json` text,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `solutions_problem_id_language_unique` ON `solutions` (`problem_id`,`language`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `user_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	`source` text NOT NULL,
	`source_problem_id` text,
	`is_equipped` integer DEFAULT false NOT NULL,
	`acquired_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_items_user_id_item_id_unique` ON `user_items` (`user_id`,`item_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`avatar_config` text DEFAULT '{}' NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);