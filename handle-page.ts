import { and, eq } from "drizzle-orm";
import db from "./db";
import { all_metadata, pages, titles, torrents } from "./db/schema";
import logger from "./logger";
import getInfosFromPage from "./get-infos-from-page";
import axios from "axios";

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
            let tmdbInfo = null;
            if (info.imdbId) {
                const { data } = await axios.get(`https://api.themoviedb.org/3/find/${info.imdbId}?api_key=${process.env.TMDB_API_KEY}&external_source=imdb_id&language=${process.env.LANGUAGE || 'en'}`);
                tmdbInfo = data
            }

            const metadata = tmdbInfo?.movie_results[0] || tmdbInfo?.tv_results[0]

            dbTitles = await db
                .insert(titles)
                .values({ imdbId: info.imdbId, tmdbId: metadata?.id })
                .returning({
                    id: titles.id
                });

            if (metadata) {
                await db
                    .insert(all_metadata)
                    .values({
                        titleId: dbTitles[0].id,
                        name: metadata.title || metadata.name,
                        adult: metadata.adult ? 1 : 0,
                        backdropUrl: `https://image.tmdb.org/t/p/original${metadata.backdrop_path}`,
                        genres: metadata.genres ? metadata.genres.map((genre: any) => genre.name).join(',') : null,
                        language: process.env.LANGUAGE || 'en',
                        posterUrl: `https://image.tmdb.org/t/p/original${metadata.poster_path}`
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