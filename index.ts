import { eq } from "drizzle-orm";
import { CONCURRENT_HANDLE_PAGE, SITEMAP_INDEX } from "./constants";
import db from "./db";
import { pages } from "./db/schema";
import getPagesFromPostSitemap from "./get-pages-from-post-sitemap";
import getPostSitemap from "./get-post-sitemap"
import handlePage from "./handle-page";
import logger from "./logger";
import { promise as fastq } from "fastq";

const queue = fastq(handlePage, CONCURRENT_HANDLE_PAGE)

async function main() {
    logger('Getting all post sitemaps...')
    const postSitemaps = await getPostSitemap(SITEMAP_INDEX);
    logger(`Found ${postSitemaps.length} post sitemaps`)

    for (const postSitemap of postSitemaps) {
        logger(`Getting pages from sitemap ${postSitemap}`)
        const gotPages = await getPagesFromPostSitemap(postSitemap);
        await db.insert(pages).values(gotPages.map(page => ({ url: page, status: 0, statusText: 'Pending' })));
        logger(`Found ${gotPages.length} pages`)
    }

    const pendingPages = await db.select().from(pages).where(eq(pages.status, 0))
    for (let i = 0; i < pendingPages.length; i++) {
        const page = pendingPages[i]

        if (!page.url) {
            continue
        }

        queue.push(page.url)
            .then(() => {
                logger(`Page ${i} of ${pendingPages.length} handled`)
            })
            .catch(error => {
                logger(`Error on page ${i}: ${error.message}`)
            })
    }
}

main()