import FMcord, { FMcordOptions } from "./handler/FMcord";
import configuration from "../config.json";
import canvas from "canvas";
import * as path from "path";

interface ConfigOptions {
    prefix: string;
    token: string;
    lastFM: {
        apikey: string;
        secret?: string;
    };
    youtube?: {
        apikey: string;
    };
    spotify?: {
        id: string;
        secret: string;
    };
    dbl?: string;
    botOwnerID: string;
}

if (process.platform === `win32`) {
    canvas.registerFont(path.join(__dirname, `../../fonts`, `Inconsolata.otf`), {
        family: `inconsolata`
    });
} else {
    canvas.registerFont(path.join(__dirname, `../../fonts`, `NotoSansCJK-Regular.ttc`), {
        family: `noto-sans`
    });
}

const config: ConfigOptions = configuration;

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

if (config.dbl) {
    options.apikeys.dbl = config.dbl;
}

const bot: FMcord = new FMcord(options);

bot.init();