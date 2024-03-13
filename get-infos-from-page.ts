import cheerio from 'cheerio';
import client from './client';

export default async function getInfosFromPage(page: string) {
    const { data: html } = await client.get(page, {
        responseType: 'text'
    });
    const $ = cheerio.load(html);

    const title = $('h1').text().trim();

    const magnets = $('a[href^="magnet:"]').toArray();
    const imdbId = $('a[href^="https://www.imdb.com/title/"]').attr('href')?.split('/').pop();

    const torrents: {
        torrentTitle?: string
        magnet: string
    }[] = [];

    for (const magnet of magnets) {
        const uri = $(magnet).attr('href');

        if (!uri) {
            continue;
        }

        const torrentTitle = new URL(uri).searchParams.get('dn');

        torrents.push({
            torrentTitle: torrentTitle || undefined,
            magnet: $(magnet).attr('href') || ''
        })
    }

    return {
        imdbId,
        pageTitle: title,
        torrents
    }
}