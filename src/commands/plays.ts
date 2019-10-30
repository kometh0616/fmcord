import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import Library from "../lib/lastfm";
import TrackFetcher from "../classes/TrackFetcher";
import snippets from "../snippets";

class PlaysCommand extends Command {

    public constructor() {
        super({
            name: `plays`,
            description: `Shows you how many times you have played an artist. If no ` +
            `artist is defined, the bot will look up an artist you are currently ` +
            `listening to.`,
            usage: [`plays`, `plays <artist name>`],
            aliases: [`p`],
            dmAvailable: true,
            requiresNickname: true
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        const lib = new Library(client.apikeys.lastFM);
        const trackFetcher = new TrackFetcher(client, message);
        const user = await trackFetcher.username();
        let artistName: string;
        if (!args.length) {
            const track = await trackFetcher.getCurrentTrack();
            if (track) {
                artistName = track.artist[`#text`];
            } else {
                await message.reply(snippets.notPlaying);
                return;
            }
        } else {
            artistName = args.join(` `);
        }
        try {
            const data = await lib.artist.getInfo(artistName, {
                username: user!
            });
            if (data.stats.userplaycount === `0`) {
                await message.reply(`you haven't scrobbled \`${data.name}\``);
            } else {
                await message.reply(`you have scrobbled \`${data.name}\` **${data.stats.userplaycount}** times.`);
            }
        } catch (e) {
            if (e.message === `The artist you supplied could not be found`) {
                await message.reply(snippets.artistNotFound(args.join(` `)));
            } else {
                throw e;
            }
        }
    }

}

module.exports = PlaysCommand;