import CommandParams from "../handler/CommandParams";
import PostCheck from "../hooks/PostCheck";
import StartTyping from "../hooks/StartTyping";
import { Message } from "eris";
import TrackFetcher from "../classes/TrackFetcher";
import snippets from "../snippets";
import Library from "../lib/lastfm";
import DiscordUserGetter from "../utils/DiscordUserGetter";
import FMcordEmbed from "../classes/FMcordEmbed";
import FMcord from "../handler/FMcord";
import UsernameAndNotDisabled from "../checks/UsernameAndNotDisabled";

export default class CompareCommand extends CommandParams {

    public constructor() {
        super(`compare`, {
            description: `Compares plays of an artist between 2 people.`,
            usage: [
                `compare <artist name> u:<discord user>`, 
                `compare <artist name> user:<discord user>`,
                `compare <discord user>`
            ].join(`, `),
            aliases: [`cm`],
            requirements: {
                custom: UsernameAndNotDisabled
            },
            hooks: {
                postCheck: PostCheck,
                preCommand: StartTyping
            },
            argsRequired: true,
            invalidUsageMessage: (message: Message) => `${message.author.mention}, you must provide an artist name and a user name!`
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        let userString: string, artistString = ``;
        const trackFetcher = new TrackFetcher((message.channel.client as FMcord), message);
        const userIndex = args.findIndex(x => x.startsWith(`u:`) || x.startsWith(`user:`));
        if (userIndex !== -1) {
            userString = args.slice(userIndex).join(` `);
            artistString = args.slice(0, userIndex).join(` `);
            if (userString.startsWith(`u:`)) {
                userString = userString.substring(2);
            } else {
                userString = userString.substring(5);
            }
            if (!artistString.length) {
                await message.channel.createMessage(`${message.author.mention}, you must provide an artist name!`);
                return;
            }
        } else {
            userString = args.join(` `);
            const currTrack = await trackFetcher.getCurrentTrack();
            if (currTrack) {
                artistString = currTrack.artist[`#text`];
            } else {
                await message.channel.createMessage(`${message.author.mention}, ${snippets.notPlaying}`);
                return;
            }
        }
        const lib = new Library((message.channel.client as FMcord).apikeys.lastFM);
        const author = await trackFetcher.username();
        const user = DiscordUserGetter(message, userString);
        if (user) {
            const username = await trackFetcher.usernameFromID(user.id);
            if (username) {
                const artistAuthor = await lib.artist.getInfo(artistString, {
                    username: author!
                });
                const artistUser = await lib.artist.getInfo(artistString, {
                    username
                });
                const authorPlays = parseInt(artistAuthor.stats.userplaycount!);
                const userPlays = parseInt(artistUser.stats.userplaycount!);
                if (authorPlays === 0) {
                    await message.channel.createMessage(`${message.author.mention}, you haven't listened to \`${artistAuthor.name}\`.`);
                } else if (userPlays === 0) {
                    await message.channel.createMessage(`${message.author.mention}, ${username} (${user.user.username}) hasn't listened to \`${artistAuthor.name}\`.`);
                } else {
                    const desc = authorPlays > userPlays ?
                        `You lead over ${user.username}#${user.discriminator} by **${authorPlays - userPlays}** plays!` :
                        authorPlays < userPlays ? 
                            `${user.username}#${user.discriminator} leads over you by **${userPlays - authorPlays}** plays!` :
                            `It's a tie between you and ${user.username}#${user.discriminator}.`;
                    const embed = new FMcordEmbed(message)
                        .setTitle(`${artistAuthor.name} comparison between ${author} and ${username}`)
                        .setDescription(desc)
                        .addField(`Your plays`, String(authorPlays))
                        .addField(`${username}'s plays`, String(userPlays));
                    await message.channel.createMessage({ embed });
                }
            } else {
                await message.channel.createMessage(`${message.author.mention}, ${snippets.userNoLogin}`);
            }
        } else {
            await message.channel.createMessage(`${message.author.mention}, ${snippets.userNotFound}`);
        }
    }

}