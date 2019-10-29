/* eslint-disable */

import config from "../config.json";

export default {  
    noLogin: `you haven't registered your Last.fm ` +
    `user account to this bot! Please do so with \`${config.prefix}` +
    `login <lastfm username>\` to be able to use this command!`,
    error: `There was an error trying to execute the ` +
    `command. Please try again later.`,
    github: `https://github.com/kometh0616/fmcord`,
    getSource: (cmd: string) => `https://github.com/kometh0616/fmcord/blob/master/src/commands/${cmd}.js`,
    notPlaying: `currently, you're not listening to anything.`,
    npNoLogin: `you haven't registered your Last.fm ` +
    `account, therefore, I can't check what you're listening to. To set ` +
    `your Last.fm nickname, do \`${config.prefix}login <lastfm username>\`.`,
    userNotFound: `Couldn't find the user in Discord. Make sure you provided a valid user correctly and try again!`,
    userNoLogin: `Couldn't find the user in my database. Make sure you provided a valid user correctly and try again!`,
    artistNotFound: (artist: string) => `couldn't find an artist named \`${artist}\`. Please check your artist's name for typos or try a different artist.`,
    arrowLeft: `⬅`,
    arrowRight: `➡`,
    exit: `❌`,
    dBotsLink: `https://top.gg/bot/521041865999515650`,
    commonReasons: {
        noLogin: `Message author wasn't logged in.`,
        notPlaying: `No currently playing track found.`,
        noArtist: `No artist provided by the message author.`,
        noUsername: `No username provided by the message author.`,
        userNotFound: `Target user wasn't found.`,
        artistNotFound: `No artist found.`
    },
    languages: [`en`, `de`, `es`, `fr`, `it`, `ja`, `pl`, `ru`, `sv`, `tr`, `zh`],
    hrefRegex: /<a href=.+/gi,
    truncate: (text: string): string => {
        const txt = text.replace(/<a href=.+/gi, ``);
        return txt.length > 768 ? `${txt.slice(0, 768)}...` : txt;
    },
    removeParens(text: string): string {
        return text.replace(`(`, `%28`)
            .replace(`)`, `%29`)
            .replace(`[`, `%5B`)
            .replace(`]`, `%5D`);
    }
}