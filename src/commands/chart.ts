import Command from "../handler/Command";
import { Message } from "discord.js";
import FMcord from "../handler/FMcord";
import * as path from "path";
import { Image, loadImage, Canvas, createCanvas } from "canvas";
import UserFetcher from "../classes/UserFetcher";
import Library from "../lib/lastfm";
import { LastFMTimePeriod, LastFMUserTopAlbums } from "../lib/lastfm/typings";
import snippets from "../snippets";
import AllSettled, { ResolvedPromise } from "../utils/polyfills/AllSettled";

const font = `12px ${process.platform === `win32` ? `inconsolata` : `noto-sans`}`;

class ChartCommand extends Command {

    public constructor() {
        super({
            name: `chart`,
            description: `Builds a grid out of your most listened albums with ` +
            `names to the side.`,
            usage: [
                `chart`, 
                `chart <time period>`, 
                `chart <time period> <grid size>`,
                `chart <time period> [nt/notitles]`,
                `chart <time period> <grid size> [nt/notitles]`
            ],
            notes: `In time period, you can have "weekly", "monthly" or "alltime".`,
            aliases: [`c`, `grid`],
            dmAvailable: true,
            cooldown: 5,
            requiresNickname: true,
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        const failed: Image = await loadImage(path.join(__dirname, `../../..`, `images`, `failed_to_load.png`));
        const userFetcher: UserFetcher = new UserFetcher(message);
        const lib: Library = new Library(client.apikeys.lastFM);
        const noTitles: string[] = [`nt`, `notitles`];
        const usageWarning = `Incorrect usage of a command! Correct usage ` +
        `would be: \`&chart <time period> <grid size> [nt/notitles]\``;
        let period: LastFMTimePeriod, x: number, y: number, time: string;
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
                    await message.channel.send(usageWarning);
                    return;
            }
            if (!args[1] || noTitles.includes(args[1])) {
                [x, y] = [5, 5];
            } else {
                const vals: string[] = args[1].split(`x`);
                if (vals.length !== 2) {
                    await message.channel.send(usageWarning);
                    return;
                }
                const numbers: number[] = vals.map(parseInt);
                if (numbers.some(isNaN)) {
                    await message.channel.send(usageWarning);
                    return;
                } else {
                    [x, y] = [...numbers];
                    if (x > 5 || y > 10) {
                        await message.channel.send(`The first number of the grid size must not ` +
                        `be bigger than 5 tiles and the last number of the grid size must ` +
                        `not be bigger than 10 tiles!`);
                        return;
                    }
                }
            }
        }
        const user: string | null = await userFetcher.username();
        if (!user) {
            await message.reply(snippets.noLogin);
            return;
        }
        const data: LastFMUserTopAlbums = await lib.user.getTopAlbums(user, {
            period
        });
        if (!data.album.length) {
            await message.reply(`you have no ${time} albums.`);
            return;
        } 
        const imageLinks: string[] = data.album.map(x => x.image[2][`#text`]);
        const proms: Promise<Image>[] = imageLinks.map(x => {
            if (x.length > 0) {
                return loadImage(x);
            } else {
                return loadImage(path.join(__dirname, `../../..`, `images`, `no_album.png`));
            }
        });
        const loaded: ResolvedPromise<Image>[] = await AllSettled<Image>(proms);
        const imgs: Image[] = loaded.map(x => x.status === `fulfilled` ? x.value! : failed);

        const canv: Canvas = createCanvas(x * 100, y * 100);
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
        if (noTitles.includes(args[2]) || noTitles.includes(args[1])) {
            console.log(`found notitles.`);
            const buffer = canv.toBuffer();
            await message.reply(`here is your grid.`, { files: [buffer] });
        } else {
            const names: string[] = data.album.map(x => `${x.artist.name} - ${x.name}`);
            const longest: string = [...names].sort((a, b) => b.length - a.length)[0];
            const length = ctx.measureText(longest);
            const xAxis = x * 100 + 120 + length.width;
            const yAxis = y * 100;
            const finalCanvas: Canvas = createCanvas(xAxis, yAxis);
            const fctx = finalCanvas.getContext(`2d`);
            fctx.fillStyle = `black`;
            fctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            fctx.drawImage(canv, 0, 0);
            fctx.fillStyle = `white`;
            fctx.font = `12px ${font}`;
            let i = 0;
            for (let byChart = 0; byChart < 100 * y; byChart += 100) {
                for (let inChart = 15; inChart <= 15 * x; inChart += 15) {
                    const yAxis = byChart + inChart;
                    if (names[i]) {
                        fctx.fillText(names[i], x * 100 + 15, yAxis);
                    }
                    i++;
                }
            }
            const buffer = finalCanvas.toBuffer();
            await message.reply(`here is your grid.`, { files: [buffer] });
        }
    }

}

module.exports = ChartCommand;