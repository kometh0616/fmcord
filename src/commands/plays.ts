import CommandParams from "../handler/CommandParams";
import PostCheck from "../hooks/PostCheck";
import StartTyping from "../hooks/StartTyping";
import { Message } from "eris";
import Library from "../lib/lastfm";
import TrackFetcher from "../classes/TrackFetcher";
import snippets from "../snippets";
import FMcord from "../handler/FMcord";
import UsernameAndNotDisabled from "../checks/UsernameAndNotDisabled";

export default class PlaysCommand extends CommandParams {

    public constructor() {
        super(`plays`, {
            description: `Shows you how many times you have played an artist. If no ` +
            `artist is defined, the bot will look up an artist you are currently ` +
            `listening to.`,
            usage: [`plays`, `plays <artist name>`].join(`, `),
            aliases: [`p`],
            requirements: {
                custom: UsernameAndNotDisabled,
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const client = message.channel.client as FMcord;
        const lib = new Library(client.apikeys.lastFM);
        const trackFetcher = new TrackFetcher(client, message);
        const user = await trackFetcher.username();
        let artistName: string;
        if (!args.length) {
            const track = await trackFetcher.getCurrentTrack();
            if (track) {
                artistName = track.artist[`#text`];
            } else {
                await message.channel.createMessage(`${message.author.mention}, ${snippets.notPlaying}`);
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
                await message.channel.createMessage(`${message.author.mention}, you haven't scrobbled \`${data.name}\``);
            } else {
                await message.channel.createMessage(`${message.author.mention}, you have scrobbled \`${data.name}\` **${data.stats.userplaycount}** times.`);
            }
        } catch (e) {
            if (e.message === `The artist you supplied could not be found`) {
                await message.channel.createMessage(`${message.author.mention}, ${snippets.artistNotFound(args.join(` `))}`);
            } else {
                throw e;
            }
        }
    }

}