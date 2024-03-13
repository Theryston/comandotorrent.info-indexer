import cheerio from 'cheerio';
import client from './client';

export default async function getPostSitemap(indexUrl: string) {
    const { data: html } = await client.get(indexUrl, {
        responseType: 'text'
    });
    const $ = cheerio.load(html);

    const allLinks = $('loc').toArray()
        .map(link => $(link).text())
        .filter(link => link.includes('post-sitemap'))

    return allLinks
}