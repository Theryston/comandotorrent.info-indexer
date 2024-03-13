import { and, eq } from "drizzle-orm";
import db from "./db";
import { pages, torrents } from "./db/schema";
import logger from "./logger";
import getInfosFromPage from "./get-infos-from-page";

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

        for (const torrent of info.torrents) {
            await db.insert(torrents).values({ torrentTitle: torrent.torrentTitle, title: info.title, magnet: torrent.magnet });
        }

        await db.update(pages).set({ status: 1, statusText: 'OK' }).where(eq(pages.url, page));

    } catch (error: any) {
        await db.update(pages).set({ status: 2, statusText: error.message || 'Unknown error' }).where(eq(pages.url, page));
        throw error
    }
}