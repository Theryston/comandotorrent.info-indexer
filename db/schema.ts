import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { v4 as uuid } from 'uuid';

export const titles = sqliteTable('titles', {
    id: text('id').primaryKey().$defaultFn(() => uuid()),
    imdbId: text('imdb_id'),
})

export const pages = sqliteTable('pages', {
    id: text('id').primaryKey().$defaultFn(() => uuid()),
    url: text('url').notNull(),
    status: integer('status').notNull(),
    statusText: text('status_text').notNull(),
    pageTitle: text('page_title'),
    titleId: text('title_id').references(() => titles.id, { onDelete: 'cascade' }),
});

export const torrents = sqliteTable('torrents', {
    id: text('id').primaryKey().$defaultFn(() => uuid()),
    torrentTitle: text('torrent_title'),
    magnet: text('magnet').notNull(),
    titleId: text('title_id').references(() => titles.id, { onDelete: 'cascade' }),
})
