CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`status` integer NOT NULL,
	`status_text` text NOT NULL,
	`page_title` text,
	`title_id` text,
	FOREIGN KEY (`title_id`) REFERENCES `titles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `titles` (
	`id` text PRIMARY KEY NOT NULL,
	`imdb_id` text
);
--> statement-breakpoint
CREATE TABLE `torrents` (
	`id` text PRIMARY KEY NOT NULL,
	`torrent_title` text,
	`magnet` text NOT NULL,
	`title_id` text,
	FOREIGN KEY (`title_id`) REFERENCES `titles`(`id`) ON UPDATE no action ON DELETE cascade
);
