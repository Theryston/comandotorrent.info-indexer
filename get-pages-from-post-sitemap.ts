import cheerio from 'cheerio';
import client from './client';

export default async function getPagesFromPostSitemap(sitemapUrl: string) {
    const { data: html } = await client.get(sitemapUrl, {
        responseType: 'text'
    });
    const $ = cheerio.load(html);

    const allLinks = $('loc').toArray()
        .map(link => $(link).text())
        .filter(link => link.split('https://comandotorrent.info/')[1])

    return allLinks
}