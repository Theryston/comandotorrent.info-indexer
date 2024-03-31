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

    let textId = await aiProcess({
        system: 'Give me the movie or tv show title and year in a unique text (like: "Lord of the Rings, 2001") from the text',
        messages: [{ text: title }]
    })
    textId = textId.replaceAll('"', '');

    return {
        textId,
        imdbId,
        pageTitle: title,
        torrents
    }
}