import CommandParams from "../handler/CommandParams";
import UsernameAndNotDisabled from "../checks/UsernameAndNotDisabled";
import StartTyping from "../hooks/StartTyping";
import PostCheck from "../hooks/PostCheck";
import { Message, User, Member } from "eris";
import DiscordUserGetter from "../utils/DiscordUserGetter";
import snippets from "../snippets";
import UserFetcher from "../classes/UserFetcher";
import Library from "../lib/lastfm";
import FMcordEmbed from "../classes/FMcordEmbed";
import FMcord from "../handler/FMcord";

export default class RecentCommand extends CommandParams {

    public constructor() {
        super(`recent`, {
            description: `Shows you recent tracks you, or a user you defined, have listened to.`,
            usage: [
                `recent`, 
                `recent <target user>`, 
                `recent s:<song amount>`,
                `recent songs:<song amount>`,
                `recent <target user> s:<song amount>`,
                `recent <target user> songs:<song amount>`
            ].join(`, `),
            fullDescription: `If you are listening to a song while invoking this command, it will ` +
            `show your currently listened song as well. The target user must be in the ` +
            `same guild that you are invoking this command into.`,
            aliases: [`r`, `latest`],
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
        const songArg = args.findIndex(x => x.startsWith(`s:`) || x.startsWith(`songs:`));
        let user: Member | User, songLimit: number;
        const client = message.channel.client as FMcord;
        if (songArg !== -1) {
            if (!songArg && args[1]) {
                await message.channel.createMessage(`${message.author.mention}, incorrect usage of a command!`);
                return;
            }
            if (!isNaN(parseInt(args[songArg].split(`:`)[1]))) {
                songLimit = parseInt(args[songArg].split(`:`)[1]);
                if (songLimit > 10 || songLimit < 1) {
                    await message.channel.createMessage(`${message.author.mention}, you cannot have more than 10 or less than 1 song.`);
                    return;
                }
            } else {
                songLimit = 5;
            }
            if (args[1]) {
                user = DiscordUserGetter(message, args.slice(0, songArg).join(` `))!;
                if (!user) {
                    await message.channel.createMessage(`${message.author.mention}, ${snippets.userNotFound}`);
                    return;
                }
            } else {
                user = message.member ?? message.author;
            }
        } else {
            songLimit = 5;
            if (args.length) {
                user = DiscordUserGetter(message, args.join(` `))!;
                if (!user) {
                    await message.channel.createMessage(`${message.author.mention}, ${snippets.userNotFound}`);
                    return;
                }
            } else {
                user = message.member ?? message.author;
            }
        }
        const userFetcher = new UserFetcher(message);
        const username = await userFetcher.usernameFromID(user.id);
        if (username) {
            const lib = new Library(client.apikeys.lastFM);
            const userInfo = await lib.user.getInfo(username);
            const tracks = await lib.user.getRecentTracks(username);
            const nowPlaying = tracks.track.find(x => x[`@attr`]);
            const sliceArgs = nowPlaying ? [1, songLimit + 1] : [0, songLimit];
            const previous = tracks.track.slice(...sliceArgs)
                .map(x => `**${x.name}** - ${x.artist[`#text`]} | ${x.album[`#text`] || `no album`}`)
                .join(`\n`);
            const embed = new FMcordEmbed(message)
                .setTitle(`Last tracks from ${username}`)
                .setURL(userInfo.url)
                .setThumbnail(tracks.track[0].image[2][`#text`]);
            if (nowPlaying) {
                const album = nowPlaying.album[`#text`] || `no album`;
                const value = `**${nowPlaying.name}** - ${nowPlaying.artist[`#text`]} | ${album}`;
                embed.addField(`Now playing`, value);
            }
            embed.addField(`Previous`, previous)
                .addField(`${username}'s scrobble amount`, userInfo.playcount);
            await message.channel.createMessage({ embed });
        } else {
            await message.channel.createMessage(`${message.author.mention}, ${snippets.userNoLogin}`);
        }
    }

}