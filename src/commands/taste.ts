import CommandParams from "../handler/CommandParams";
import UsernameAndNotDisabled from "../checks/UsernameAndNotDisabled";
import StartTyping from "../hooks/StartTyping";
import PostCheck from "../hooks/PostCheck";
import { Message } from "eris";
import DiscordUserGetter from "../utils/DiscordUserGetter";
import UserFetcher from "../classes/UserFetcher";
import Library from "../lib/lastfm";
import FMcordEmbed from "../classes/FMcordEmbed";
import snippets from "../snippets";
import FMcord from "../handler/FMcord";

interface MatchInfo {
    name: string;
    authorPlays: string;
    userPlays: string;
    diff: number;
}

const difference: (a: number, b: number) => number = (a, b) => Math.abs(a - b);

export default class TasteCommand extends CommandParams {

    public constructor() {
        super(`taste`, {
            description: `Compares artists you and a mentioned user listen to, and ` +
            `amounts of plays you both have.`,
            usage: `taste <user>`,
            fullDescription: `This only works in a guild and only if both of the users are ` +
            `registered to the bot.`,
            aliases: [`t`],
            guildOnly: true,
            requirements: {
                custom: UsernameAndNotDisabled
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            },
            argsRequired: true,
            invalidUsageMessage: (message: Message) => `${message.author.mention}, specify a user you want to compare tastes with!`
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const client = message.channel.client as FMcord;
        const user = DiscordUserGetter(message, args.join(` `));
        if (user !== null) {
            if (user.id !== message.author.id) {
                const userFetcher = new UserFetcher(message);
                const lib = new Library(client.apikeys.lastFM);
                const username = await userFetcher.usernameFromID(user.id);
                const author = await userFetcher.username();
                if (username !== null) {
                    const authorData = await lib.user.getTopArtists(author!, {
                        period: `overall`,
                        limit: `150`
                    });
                    const userData = await lib.user.getTopArtists(username, {
                        period: `overall`,
                        limit: `150`
                    });
                    const matches: MatchInfo[] = [];
                    for (const a of userData.artist) {
                        const match = authorData.artist.find(x => x.name === a.name);
                        if (match) {
                            const matchCount = parseInt(match.playcount);
                            const userCount = parseInt(a.playcount);
                            const diff = difference(matchCount, userCount);
                            const data: MatchInfo = {
                                name: match.name,
                                authorPlays: match.playcount,
                                userPlays: a.playcount,
                                diff
                            };
                            if (matches.length !== 10) {
                                matches.push(data);
                            } else {
                                break;
                            }
                        }
                    }
                    if (matches.length) {
                        matches.sort((a, b) => b.diff - a.diff);
                        const embed = new FMcordEmbed(message)
                            .setTitle(`${author} and ${username} taste comparison`);
                        matches.forEach(m => {
                            const comp = `**${m.authorPlays}** plays - **${m.userPlays}** plays`;
                            embed.addField(m.name, comp, true);
                        });
                        await message.channel.createMessage({ embed });
                    } else {
                        await message.channel.createMessage(`${message.author.mention}, you and ${username} (${user.username}) share no common artists.`);
                    }
                } else {
                    await message.channel.createMessage(`${message.author.mention}, ${snippets.userNoLogin}`);
                }
            } else {
                await message.channel.createMessage(`${message.author.mention}, you cannot apply this command to yourself.`);
            }
        } else {
            await message.channel.createMessage(`${message.author.mention}, ${snippets.userNotFound}`);
        }
    }

}