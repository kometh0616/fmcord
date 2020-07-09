/* eslint-disable */

import config from "./config";
import { Message } from "eris";

export default {  
    noLogin: `you haven't registered your Last.fm ` +
    `user account to this bot! Please do so with \`${config.prefix}` +
    `login <lastfm username>\` to be able to use this command!`,
    error: `There was an error trying to execute the ` +
    `command. Please try again later.`,
    github: `https://github.com/kometh0616/fmcord`,
    getSource: (cmd: string) => `https://github.com/kometh0616/fmcord/blob/master/src/commands/${cmd}.ts`,
    notPlaying: `currently, you're not listening to anything.`,
    npNoLogin: `you haven't registered your Last.fm ` +
    `account, therefore, I can't check what you're listening to. To set ` +
    `your Last.fm nickname, do \`${config.prefix}login <lastfm username>\`.`,
    userNotFound: `couldn't find the user in Discord. Make sure you provided a valid user correctly and try again!`,
    userNoLogin: `couldn't find the user in my database. Make sure you provided a valid user correctly and try again!`,
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
    truncate(text: string): string {
        const txt = text.replace(/<a href=.+/gi, ``);
        return txt.length > 768 ? `${txt.slice(0, 768)}...` : txt;
    },
    removeParens(text: string): string {
        return text.replace(`(`, `%28`)
            .replace(`)`, `%29`)
            .replace(`[`, `%5B`)
            .replace(`]`, `%5D`);
    },
    clickify(name: string, url: string): string {
        return `[${name}](${this.removeParens(url)})`;
    },
    formatSeconds(seconds: string): string {
        const toInt = parseInt(seconds);
        if (isNaN(toInt)) {
            throw new TypeError(`The parameter must be a string number.`);
        }
        const hours = Math.floor(toInt / 3600);
        const minutes = hours !== 0 ? Math.floor((toInt - hours * 3600) / 60) : Math.floor(toInt / 60);
        const secs = hours !== 0 ? Math.floor((toInt - hours * 3600) - (minutes * 60)) : Math.floor(toInt - minutes * 60);
        if (hours !== 0) {
            return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}:${secs < 10 ? `0${secs}` : secs}`;
        } else {
            return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
        }
    },
    cooldown: (message: Message) => `${message.author.mention}, you are already executing a command! Please wait until your command is executed.`
}