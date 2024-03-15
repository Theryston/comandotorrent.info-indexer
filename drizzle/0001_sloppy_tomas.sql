CREATE TABLE `all_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`title_id` text,
	`name` text NOT NULL,
	`adult` integer NOT NULL,
	`backdrop_url` text NOT NULL,
	`language` text NOT NULL,
	`poster_url` text NOT NULL,
	`genres` text,
	FOREIGN KEY (`title_id`) REFERENCES `titles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE titles ADD `tmdb_id` text;