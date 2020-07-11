import * as dotenv from 'dotenv';
dotenv.config();

export default {
    prefix: process.env.BOT_PREFIX ?? `&`,
    lastFM: {
        apikey: process.env.LASTFM_API_KEY ?? ``,
    },
    youtube: {
        apikey: process.env.YOUTUBE_API_KEY ?? ``,
    },
    spotify: {
        id: process.env.SPOTIFY_API_KEY ?? ``,
        secret: process.env.SPOTIFY_API_SECRET ?? ``,
    },
    ownerID: process.env.BOT_OWNER_ID ?? ``,
    token: process.env.DISCORD_API_TOKEN ?? ``
};
