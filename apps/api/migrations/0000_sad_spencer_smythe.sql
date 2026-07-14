CREATE TABLE `areas` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`position` integer NOT NULL,
	`unlock_rating` integer DEFAULT 1 NOT NULL,
	`gate_x` integer,
	`gate_y` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
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
	`area_id` text NOT NULL,
	`npc_motif` text DEFAULT 'student' NOT NULL,
	`statement_md` text NOT NULL,
	`constraints_md` text NOT NULL,
	`constraints_note_md` text,
	`statement_note_md` text,
	`map_x` integer,
	`map_y` integer,
	`map_order` integer,
	`is_published` integer DEFAULT false NOT NULL,
	`added_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`problem_id` text NOT NULL,
	`language` text DEFAULT 'python' NOT NULL,
	`code` text NOT NULL,
	`verdict` text NOT NULL,
	`sample_results_json` text,
	`submitted_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`rating` integer DEFAULT 1 NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);