import { eq, or } from "drizzle-orm";
import { CONCURRENT_HANDLE_PAGE, SITEMAP_INDEX } from "./constants";
import db from "./db";
import { pages } from "./db/schema";
import getPagesFromPostSitemap from "./get-pages-from-post-sitemap";
import getPostSitemap from "./get-post-sitemap"
import handlePage from "./handle-page";
import logger from "./logger";
import { promise as fastq } from "fastq";
import moment from "moment";
import { changeState } from "./state";

const queue = fastq(handlePage, CONCURRENT_HANDLE_PAGE)

async function main() {
    await changeState({ isWaiting: true });
    logger(`Getting all sitemaps from ${SITEMAP_INDEX}`);
    const postSitemaps = await getPostSitemap(SITEMAP_INDEX);
    await changeState({ isWaiting: false });

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

    let averageTime = 0;
    let estimatedTimeToFinish = 0;
    let totalTime = 0;
    let totalProcessedPages = 0;
    for (let i = 0; i < indexedPendingPages.length; i++) {
        const page = indexedPendingPages[i]

        if (!page.url) {
            continue
        }

        let start = Date.now();
        queue.push(page.url)
            .catch(error => {
                logger(`Error on page ${i + 1}: ${error.message}`)
            }).finally(() => {
                const end = Date.now();
                totalProcessedPages++;
                totalTime += end - start;
                averageTime = totalTime / totalProcessedPages
                estimatedTimeToFinish = Math.round((averageTime * (indexedPendingPages.length - totalProcessedPages)) / CONCURRENT_HANDLE_PAGE)

                const averageTimeFormatted = moment.utc(averageTime).format('HH [hours] mm [minutes] ss [seconds]')
                const estimatedTimeToFinishFormatted = moment.utc(estimatedTimeToFinish).format('HH [hours] mm [minutes] ss [seconds]')

                logger(`Processed ${totalProcessedPages} of ${indexedPendingPages.length} pages. Average time: ${averageTimeFormatted}. Estimated time to finish: ${estimatedTimeToFinishFormatted}`)
            })
    }
}

main()