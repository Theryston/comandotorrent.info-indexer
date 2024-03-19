import cheerio from 'cheerio';
import client from './client';
import aiProcess from './ai-process';

export default async function getInfosFromPage(page: string) {
    const { data: html } = await client.get(page, {
        responseType: 'text'
    });
    const $ = cheerio.load(html);
    const title = $('h1').text().trim();

    const imdbId = $('a[href^="https://www.imdb.com/title/"]')
        .attr('href')
        ?.split('https://www.imdb.com/title/')[1]
        ?.split('/')[0]

    const name = await aiProcess({
        system: "You are a system that have to give me the movie or tv show title (only the title) from the user text",
        messages: [{ text: title }]
    })

    const article = $('article').html();

    if (!article) {
        throw new Error('article not found');
    }

    const torrentsStr = await aiProcess({
        system: `Search for all magnet links in this HTML and form an array of data in the format: \n\n[{\n    "magnetUri": "magnet:?xt=urn:btih...", // This is the link itself\n    "title\": "BluRay..." // This is the text that is close to the magnet on the DOM. Please rewrite it better for understanding in ${process.env.LANGUAGE || "en"}\n}]\n\nYou are a system, so just return the code in a pure text (no markdown, no js, nothing, just JSON sting without breaking lines or sintax error)`,
        messages: [{ text: article }]
    });
    const torrents = JSON.parse(torrentsStr).map((torrent: any) => ({ magnet: torrent.magnetUri, torrentTitle: torrent.title }));

    return {
        name,
        imdbId,
        pageTitle: title,
        torrents
    }
}