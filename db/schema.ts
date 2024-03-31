import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { v4 as uuid } from 'uuid';

export const state = sqliteTable('state', {
    id: text('id').primaryKey().$defaultFn(() => uuid()),
    isWaiting: integer('is_waiting').notNull().default(0),
})

export const titles = sqliteTable('titles', {
    id: text('id').primaryKey().$defaultFn(() => uuid()),
    tmdbId: text('tmdb_id'),
    imdbId: text('imdb_id'),
})

export const all_metadata = sqliteTable('all_metadata', {
    id: text('id').primaryKey().$defaultFn(() => uuid()),
    titleId: text('title_id').references(() => titles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    adult: integer('adult').notNull(),
    backdropUrl: text('backdrop_url').notNull(),
    language: text('language').notNull(),
    posterUrl: text('poster_url').notNull(),
    genres: text('genres'),
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
