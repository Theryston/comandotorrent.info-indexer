import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { v4 as uuid } from 'uuid';

export const pages = sqliteTable('pages', {
    id: text('id').primaryKey().$defaultFn(() => uuid()),
    url: text('url'),
    status: integer('status'),
    statusText: text('status_text'),
});

export const torrents = sqliteTable('torrents', {
    id: text('id').primaryKey().$defaultFn(() => uuid()),
    torrentTitle: text('torrent_title').notNull(),
    title: text('title').notNull(),
    magnet: text('magnet').notNull(),
})
