import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import DiscordUserGetter from "../utils/DiscordUserGetter";
import snippets from "../snippets";
import UserFetcher from "../classes/UserFetcher";
import Library from "../lib/lastfm";
import FMcordEmbed from "../classes/FMcordEmbed";

interface MatchInfo {
    name: string;
    authorPlays: string;
    userPlays: string;
    diff: number;
}

const difference: (a: number, b: number) => number = (a, b) => Math.abs(a - b);

class TasteCommand extends Command {

    public constructor() {
        super({
            name: `taste`,
            description: `Compares artists you and a mentioned user listen to, and ` +
            `amounts of plays you both have.`,
            usage: [`taste <user>`],
            notes: `This only works in a guild and only if both of the users are ` +
            `registered to the bot.`,
            aliases: [`t`],
            requiresNickname: true
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        if (args.length) {
            const user = DiscordUserGetter(message, args.join(` `));
            if (user) {
                if (user.id !== message.author.id) {
                    const userFetcher = new UserFetcher(message);
                    const lib = new Library(client.apikeys.lastFM);
                    const username = await userFetcher.usernameFromID(user.id);
                    const author = await userFetcher.username();
                    if (username) {
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
                                .setTitle(`${author} and ${username} taste comparison`)
                            matches.forEach(m => {
                                const comp = `${m.authorPlays} plays - ${m.userPlays}`;
                                embed.addField(m.name, comp, true);
                            });
                            await message.channel.send(embed);
                        } else {
                            await message.reply(`you and ${username} (${user.user.tag}) share no common artists.`);
                        }
                    } else {
                        await message.reply(snippets.userNoLogin);
                    }
                } else {
                    await message.reply(`you cannot apply this command to yourself.`);
                }
            } else {
                await message.reply(snippets.userNotFound);
            }
        } else {
            await message.reply(`specify a user you want to compare tastes with!`);
        }
    }

}

module.exports = TasteCommand;