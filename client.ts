import axios from "axios";

if (!process.env.BRIGHTDATA_USERNAME) {
    throw new Error('missing BRIGHTDATA_USERNAME in .env')
}

if (!process.env.BRIGHTDATA_PASSWORD) {
    throw new Error('missing BRIGHTDATA_PASSWORD in .env')
}

const client = axios.create({
    proxy: {
        protocol: 'http',
        host: 'brd.superproxy.io',
        port: 22225,
        auth: {
            username: process.env.BRIGHTDATA_USERNAME as string,
            password: process.env.BRIGHTDATA_PASSWORD as string
        }
    }
})

export default client