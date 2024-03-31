import { and, eq } from "drizzle-orm";
import db from "./db";
import { all_metadata, pages, titles, torrents } from "./db/schema";
import logger from "./logger";
import getInfosFromPage from "./get-infos-from-page";
import axios from "axios";
import findMetadataByTextId from "./find-metadata-by-name";

export default async function handlePage(page: string) {
    try {
        const processedPages = await db.select().from(pages).where(and(eq(pages.url, page), eq(pages.status, 1)));

        if (processedPages.length) {
            logger(`Page ${page} already processed`);
            return;
        }

        const dbPages = await db.select().from(pages).where(and(eq(pages.url, page), eq(pages.status, 0)));

        if (!dbPages.length) {
            logger(`Page ${page} not found in database`);
            return;
        }

        const info = await getInfosFromPage(page);

        let dbTitles: any[] = [];

        if (info.imdbId) {
            dbTitles = await db
                .select({ id: titles.id })
                .from(titles)
                .where(eq(titles.imdbId, info.imdbId))
        }

        if (!dbTitles.length) {
            const metadata = info.name ? await findMetadataByTextId(info.name) : null;

            dbTitles = await db
                .insert(titles)
                .values({ imdbId: info.imdbId, tmdbId: metadata?.id })
                .returning({
                    id: titles.id
                });

            if (metadata) {
                const apiUrl = metadata.media_type === 'movie' ? `https://api.themoviedb.org/3/movie/${metadata.id}` : `https://api.themoviedb.org/3/tv/${metadata.id}`;

                const { data } = await axios.get(`${apiUrl}?api_key=${process.env.TMDB_API_KEY}&language=${process.env.LANGUAGE || 'en'}`);

                await db
                    .insert(all_metadata)
                    .values({
                        titleId: dbTitles[0].id,
                        name: metadata.title || metadata.name,
                        adult: metadata.adult ? 1 : 0,
                        backdropUrl: `https://image.tmdb.org/t/p/original${metadata.backdrop_path}`,
                        language: process.env.LANGUAGE || 'en',
                        posterUrl: `https://image.tmdb.org/t/p/original${metadata.poster_path}`,
                        genres: data.genres?.map((genre: any) => genre.name).join(' | ')
                    });
            }
        }

        const dbTitle = dbTitles[0];

        for (const torrent of info.torrents) {
            await db
                .insert(torrents)
                .values({
                    titleId: dbTitle.id,
                    torrentTitle: torrent.torrentTitle,
                    magnet: torrent.magnet
                });
        }

        await db
            .update(pages)
            .set({ status: 1, statusText: 'OK', titleId: dbTitle.id, pageTitle: info.pageTitle })
            .where(eq(pages.url, page));
    } catch (error: any) {
        await db.update(pages).set({ status: 2, statusText: error.message || 'Unknown error' }).where(eq(pages.url, page));
        throw error
    }
}