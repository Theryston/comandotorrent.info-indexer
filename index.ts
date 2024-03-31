import { eq, or } from "drizzle-orm";
import { CONCURRENT_HANDLE_PAGE, SITEMAP_INDEX } from "./constants";
import db from "./db";
import { pages } from "./db/schema";
import getPagesFromPostSitemap from "./get-pages-from-post-sitemap";
import getPostSitemap from "./get-post-sitemap"
import handlePage from "./handle-page";
import logger from "./logger";
import { promise as fastq } from "fastq";
import { changeState } from "./state";

const queue = fastq(handlePage, CONCURRENT_HANDLE_PAGE)

async function main() {
    await changeState({ isWaiting: false })

    logger(`Getting all sitemaps from ${SITEMAP_INDEX}`);
    const postSitemaps = await getPostSitemap(SITEMAP_INDEX);

    for (const postSitemap of postSitemaps) {
        const gotPages = await getPagesFromPostSitemap(postSitemap);

        for (const page of gotPages) {
            const alreadyIndexedPages = await db
                .select({ id: pages.id })
                .from(pages)
                .where(eq(pages.url, page));

            if (alreadyIndexedPages.length) {
                logger(`Page ${page} already indexed`)
                continue
            }

            await db.insert(pages).values({ url: page, status: 0, statusText: 'Pending' });
            logger(`Page ${page} was indexed`)
        }
    }

    const indexedPendingPages = await db
        .select({ url: pages.url })
        .from(pages)
        .where(or(eq(pages.status, 0), eq(pages.status, 2)));

    for (let i = 0; i < indexedPendingPages.length; i++) {
        const page = indexedPendingPages[i]

        if (!page.url) {
            continue
        }

        queue.push(page.url)
            .then(() => {
                logger(`Torrents from page ${i + 1} of ${indexedPendingPages.length} indexed`)
            })
            .catch(error => {
                logger(`Error on page ${page.url}\n: ${error.message}`)
            })
    }
}

main()