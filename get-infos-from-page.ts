import cheerio from 'cheerio';
import client from './client';
import aiProcess from './ai-process';

export default async function getInfosFromPage(page: string) {
    const { data: html } = await client.get(page, {
        responseType: 'text'
    });
    const $ = cheerio.load(html);

    const title = $('h1').text().trim();

    const magnets = $('a[href^="magnet:"]').toArray();
    const imdbId = $('a[href^="https://www.imdb.com/title/"]')
        .attr('href')
        ?.split('https://www.imdb.com/title/')[1]
        ?.split('/')[0]

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

    const name = await aiProcess({
        system: 'Give me the movie or tv show title (only the title) from the text',
        messages: [{ text: title }]
    })

    return {
        name,
        imdbId,
        pageTitle: title,
        torrents
    }
}