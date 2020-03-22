import CommandParams from "../handler/CommandParams";
import snippets from "../snippets";
import PostCheck from "../hooks/PostCheck";
import { Message, Member } from "eris";
import { Image, loadImage, createCanvas } from "canvas";
import * as path from "path";
import Library from "../lib/lastfm";
import UserFetcher from "../classes/UserFetcher";
import { LastFMTimePeriod } from "../lib/lastfm/typings";
import DiscordUserGetter from "../utils/DiscordUserGetter";
import AllSettled from "../utils/polyfills/AllSettled";
import StartTyping from "../hooks/StartTyping";
import FMcord from "../handler/FMcord";
import UsernameAndNotDisabled from "../checks/UsernameAndNotDisabled";

const font = `12px ${process.platform === `win32` ? `inconsolata` : `noto-sans`}`;

export default class ChartCommand extends CommandParams {

    public constructor() {
        super(`chart`, {
            aliases: [`c`],
            usage: [
                `chart`,
                `chart <time period>`,
                `chart <time period> <grid size>`,
                `chart <time period> [nt/notitles]`,
                `chart <time period> <grid size> <user>`,
                `chart <time period> <grid size> [nt/notitles]`,
                `chart <time period> <grid size> [nt/notitles] <user>`
            ].join(`, `),
            description: `Builds a grid out of your most listened albums with names to the side.`,
            fullDescription: `You can attach an image to the command to have that image as your ` +
            `chart's background.`,
            cooldown: 5000,
            cooldownMessage: snippets.cooldown,
            requirements: {
                custom: UsernameAndNotDisabled
            },
            hooks: {
                postCheck: PostCheck,
                preCommand: StartTyping
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const failed = await loadImage(path.join(__dirname, `../../..`, `images`, `failed_to_load.png`));
        const client = message.channel.client as FMcord;
        const userFetcher = new UserFetcher(message);
        const lib = new Library(client.apikeys.lastFM);
        const prefix = message.guildID !== null ? client.guildPrefixes[message.guildID!] ?? client.prefix : client.prefix;
        const noTitles = [`nt`, `notitles`];
        const usageWarning = `Incorrect usage of a command! Correct usage ` +
        `would be: \`${prefix}chart <time period> <grid size> [nt/notitles]\``;
        let period: LastFMTimePeriod, x: number, y: number, time: string, userID: string = message.author.id;
        if (!args.length) {
            time = `weekly`;
            period = `7day`;
            [x, y] = [5, 5];
        } else {
            switch (args[0]) {
                case `weekly`:
                case `w`:
                    time = `weekly`;
                    period = `7day`;
                    break;
                case `monthly`:
                case `m`:
                    time = `monthly`;
                    period = `1month`;
                    break;
                case `yearly`:
                case `y`:
                    time = `yearly`;
                    period = `12month`;
                    break;
                case `alltime`:
                case `a`:
                    time = `alltime`;
                    period = `overall`;
                    break;
                default:
                    await message.channel.createMessage(usageWarning);
                    return;
            }
            if (!args[1] || noTitles.includes(args[1])) {
                [x, y] = [5, 5];
            } else {
                const vals = args[1].split(`x`);
                if (vals.length !== 2) {
                    await message.channel.createMessage(usageWarning);
                    return;
                }
                const numbers = [parseInt(vals[0]), parseInt(vals[1])];
                if (numbers.some(isNaN)) {
                    await message.channel.createMessage(usageWarning);
                    return;
                } else {
                    [x, y] = [...numbers];
                    if (x > 5 || y > 10) {
                        await message.channel.createMessage(`The first number of the grid size must not ` +
                        `be bigger than 5 tiles and the last number of the grid size must ` +
                        `not be bigger than 10 tiles!`);
                        return;
                    }
                    if (args[2] && !noTitles.includes(args[2])) {
                        const member = DiscordUserGetter(message, args.slice(2).join(` `));
                        if (member !== null && member !== undefined) {
                            userID = member.id;
                        } else {
                            await message.channel.createMessage(`${message.author.mention}, ${snippets.userNotFound}`);
                            return;
                        }
                    }
                }
            }
        }
        let member: Member | null = null;
        if (args.length > 3 && userID === message.author.id) {
            member = DiscordUserGetter(message, args.slice(3).join(` `));
            if (member !== null) {
                userID = member.id;
            } else {
                await message.channel.createMessage(`${message.author.mention}, ${snippets.userNotFound}`);
                return;
            }
        }
        const user = await userFetcher.usernameFromID(userID);
        if (!user) {
            await message.channel.createMessage(`${message.author.mention}, ${snippets.userNoLogin}`);
            return;
        }
        const data = await lib.user.getTopAlbums(user, {
            period
        });
        if (!data.album.length) {
            await message.channel.createMessage(`${message.author.mention}, ${member?.username ?? `you`} ha${member === null ? `ve` : `s`} no ${time} albums.`);
            return;
        }
        const imageLinks = data.album.map(x => x.image[2][`#text`]);
        const proms = imageLinks.map(x => x.length > 0 ? loadImage(x) : loadImage(path.join(__dirname, `..`, `..`, `..`, `images`, `no_album.png`)));
        const loaded = await AllSettled<Image>(proms);
        const imgs = loaded.map(x => x.status === `fulfilled` ? x.value! : failed);
        const canv = createCanvas(x * 100, y * 100);
        const ctx = canv.getContext(`2d`);
        let iter = 0;
        for (let yAxis = 0; yAxis < y * 100; yAxis += 100) {
            if (imgs[iter]) {
                for (let xAxis = 0; xAxis < x * 100; xAxis += 100) {
                    if (imgs[iter]) {
                        ctx.drawImage(imgs[iter], xAxis, yAxis, 100, 100);
                        iter++;
                    } else break;
                }
            } else break;
        }
        if (noTitles.includes(args[1]) || noTitles.includes(args[2])) {
            const buffer = canv.toBuffer();
            await message.channel.createMessage(`${message.author.mention}, here is your grid.`, {
                file: buffer,
                name: `${user}_grid.jpg`
            });
        } else {
            const namesAndLength = new Map<string, TextMetrics>(
                data.album.map(x => {
                    const text = `${x.artist.name} - ${x.name}`;
                    return [text, ctx.measureText(text)];
                })
            );
            const names: string[] = [...namesAndLength.keys()];
            const length = Math.max(...[...namesAndLength.values()].map(x => x.width));
            const xAxis = x * 100 + 170 + length;
            const yAxis = y * 100 + 50;
            const finalCanvas = createCanvas(xAxis, yAxis);
            const fctx = finalCanvas.getContext(`2d`);
            if (message.attachments.length > 0) {
                const attachedImage = await loadImage(message.attachments[0].url);
                const coefficient = Math.max(finalCanvas.height / attachedImage.height, finalCanvas.width / attachedImage.width);
                const stretchedHeight = attachedImage.height * coefficient;
                const stretchedWidth = attachedImage.width * coefficient;
                fctx.drawImage(
                    attachedImage,
                    -((stretchedWidth - finalCanvas.width) / 2), 
                    -((stretchedHeight - finalCanvas.height) / 2), 
                    stretchedWidth,
                    stretchedHeight,
                );
            } else {
                fctx.fillStyle = `black`;
                fctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            }
            fctx.drawImage(canv, 25, 25);
            fctx.fillStyle = `white`;
            fctx.font = `12px ${font}`;
            let i = 0;
            for (let byChart = 25; byChart < 100 * y + 25; byChart += 100) {
                for (let inChart = 15; inChart <= 15 * x; inChart += 15) {
                    const yAxis = byChart + inChart;
                    if (names[i]) {
                        fctx.fillText(names[i], x * 100 + 40, yAxis);
                    }
                    i++;
                }
            }
            const buffer = finalCanvas.toBuffer();
            await message.channel.createMessage(`${message.author.mention}, here is your grid.`, {
                file: buffer,
                name: `file.jpg`
            });
        }
    }

}