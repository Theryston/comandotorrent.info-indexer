CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text,
	`status` integer,
	`status_text` text
);
--> statement-breakpoint
CREATE TABLE `torrents` (
	`id` text PRIMARY KEY NOT NULL,
	`torrent_title` text NOT NULL,
	`title` text NOT NULL,
	`magnet` text NOT NULL
);
