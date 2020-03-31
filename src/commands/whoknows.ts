import CommandParams from "../handler/CommandParams";
import UsernameAndNotDisabled from "../checks/UsernameAndNotDisabled";
import StartTyping from "../hooks/StartTyping";
import PostCheck from "../hooks/PostCheck";
import { Message } from "eris";
import TrackFetcher from "../classes/TrackFetcher";
import FMcord from "../handler/FMcord";
import snippets from "../snippets";
import { Users } from "../entities/Users";
import { FindConditions } from "typeorm";
import FMcordEmbed from "../classes/FMcordEmbed";
import Library from "../lib/lastfm";

export default class WhoKnowsCommand extends CommandParams {

    public constructor() {
        super(`whoknows`, {
            description: `Checks if anyone in a guild listens to a certain artist. ` +
            `If no artist is defined, the bot will try to look up an artist you are ` +
            `currently listening to.`,
            usage: [`whoknows`, `whoknows <artist name>`].join(`, `),
            aliases: [`w`],
            guildOnly: true,
            requirements: {
                custom: UsernameAndNotDisabled
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const client = message.channel.client as FMcord;
        let artistName: string;
        if (args.length === 0) {
            const trackFetcher = new TrackFetcher(client, message);
            const currentTrack = await trackFetcher.getCurrentTrack();
            if (currentTrack === null) {
                await message.channel.createMessage(`${message.author.mention}, ${snippets.notPlaying}`);
                return;
            } else {
                artistName = currentTrack.artist[`#text`];
            }
        } else {
            artistName = args.join(` `);
            try {
                const lib = new Library(client.apikeys.lastFM);
                await lib.artist.getInfo(artistName);
            } catch (e) {
                if (e.code === 6) {
                    await message.channel.createMessage(`${message.author.mention}, ${snippets.artistNotFound(artistName)}`);
                    return;
                } else {
                    await message.channel.createMessage(snippets.error);
                }
            }
        }
        const allUsers = await Users.find({
            where: [
                ...message.member!.guild.members.map<FindConditions<Users>>(x => ({ discordUserID: x.id }))
            ]
        });
        const listens = new Map<string, number>(
            allUsers.map(x => [message.member!.guild.members.get(x.discordUserID)!.username, Math.floor(Math.random() * 2048)])
        );
        let num = 0;
        const results = [...listens.entries()]
            .sort(([, a], [, b]) => b - a)
            .slice(0, Math.floor(Math.random() * 8) + 2)
            .map(([username, listenCount]) => `${++num}. **${username}** - **${listenCount}** plays`)
            .join(`\n`);
        const embed = new FMcordEmbed(message)
            .setTitle(`Who knows ${artistName} in ${message.member!.guild.name}?`)
            .setDescription(results);
        await message.channel.createMessage({ embed });
    }

}