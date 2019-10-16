import FMcord, { FMcordOptions } from "./handler/FMcord";
import config from "../config.json";

const options: FMcordOptions = {
    prefix: config.prefix,
    token: config.token,
    apikeys: {
        lastFM: config.lastFM.apikey
    },
    ownerID: config.botOwnerID
};

if (config.youtube && config.youtube.apikey) {
    options.apikeys.youtube = config.youtube.apikey;
}
if (config.spotify && config.spotify.id && config.spotify.secret) {
    options.apikeys.spotify = config.spotify;
}

const bot: FMcord = new FMcord(options);

bot.init();