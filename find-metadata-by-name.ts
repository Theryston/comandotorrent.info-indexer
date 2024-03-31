import axios from "axios";

export default async function findMetadataByTextId(textId: string) {
    const [name, year] = textId.split(', ');
    const { data } = await axios.get(`https://api.themoviedb.org/3/search/multi?query=${name}&api_key=${process.env.TMDB_API_KEY}&language=${process.env.LANGUAGE || 'en'}`);

    let metadata = null;

    for (const item of data.results) {
        if (item.release_date && item.release_date.split('-')[0] === year) {
            metadata = item;
            break;
        }
    }

    return metadata
}