import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import TrackFetcher from "../classes/TrackFetcher";
import snippets from "../snippets";
import Library from "../lib/lastfm";
import DiscordUserGetter from "../utils/DiscordUserGetter";
import FMcordEmbed from "../classes/FMcordEmbed";

class CompareCommand extends Command {

    public constructor() {
        super({
            name: `compare`,
            description: `Compares plays of an artist between 2 people.`,
            usage: [
                `compare <artist name> u:<discord user>`, 
                `compare <artist name> user:<discord user>`,
                `compare <discord user>`
            ],
            aliases: [`cm`],
            requiresNickname: true
        });
    }

    
    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        let userString: string, artistString = ``;
        const trackFetcher = new TrackFetcher(client, message);
        if (args.length) {
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
                    await message.reply(`you must provide an artist name!`);
                    return;
                }
            } else {
                userString = args.join(` `);
                const currTrack = await trackFetcher.getCurrentTrack();
                if (currTrack) {
                    artistString = currTrack.artist[`#text`];
                } else {
                    await message.reply(snippets.notPlaying);
                    return;
                }
            }
            const lib = new Library(client.apikeys.lastFM);
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
                        await message.reply(`you haven't listened to \`${artistAuthor.name}\`.`);
                    } else if (userPlays === 0) {
                        await message.reply(`${username} (${user.user.username}) hasn't listened to \`${artistAuthor.name}\`.`);
                    } else {
                        const desc = authorPlays > userPlays ?
                            `You lead over ${user.user.tag} by **${authorPlays - userPlays}** plays!` :
                            authorPlays < userPlays ? 
                                `${user.user.tag} leads over you by **${userPlays - authorPlays}** plays!` :
                                `It's a tie between you and ${user.user.tag}.`;
                        const embed = new FMcordEmbed(message)
                            .setTitle(`${artistAuthor.name} comparison between ${author} and ${username}`)
                            .setDescription(desc)
                            .addField(`Your plays`, authorPlays)
                            .addField(`${username}'s plays`, userPlays);
                        await message.channel.send(embed);
                    }
                } else {
                    await message.reply(snippets.userNoLogin);
                }
            } else {
                await message.reply(snippets.userNotFound);
            }
        } else {
            await message.reply(`you must provide an artist name and a user name!`);
        }
    }

}

module.exports = CompareCommand;