import cheerio from 'cheerio';
import client from './client';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

    const nameRes = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: `Give me the movie or tv show title (only the title) from this text: ${title}\nTitle: `,
    })

    const name = nameRes.choices[0].text.trim();

    return {
        name,
        imdbId,
        pageTitle: title,
        torrents
    }
}