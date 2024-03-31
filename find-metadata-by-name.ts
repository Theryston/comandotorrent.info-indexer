import axios from "axios";

type Metadata = {
    id: string;
    media_type: string;
    title?: string;
    name?: string;
    adult: boolean;
    backdrop_path: string;
    poster_path: string;
}

export default async function findMetadataByTextId(textId: string): Promise<Metadata | null> {
    let metadata = null;

    if (!textId) {
        return metadata
    }

    const [name, year] = textId.split(', ');
    const { data } = await axios.get(`https://api.themoviedb.org/3/search/multi?query=${name}&api_key=${process.env.TMDB_API_KEY}&language=${process.env.LANGUAGE || 'en'}`);

    for (const item of data.results) {
        if (item.release_date && item.release_date.split('-')[0] === year) {
            metadata = item;
            break;
        }
    }

    return metadata
}