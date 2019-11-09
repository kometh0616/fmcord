import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message, GuildMember } from "discord.js";
import DiscordUserGetter from "../utils/DiscordUserGetter";
import snippets from "../snippets";
import UserFetcher from "../classes/UserFetcher";
import Library from "../lib/lastfm";
import FMcordEmbed from "../classes/FMcordEmbed";

class RecentCommand extends Command {

    public constructor() {
        super({
            name: `recent`,
            description: `Shows you recent tracks you, or a user you defined, have listened to.`,
            usage: [
                `recent`, 
                `recent <target user>`, 
                `recent s:<song amount>`,
                `recent songs:<song amount>`,
                `recent <target user> s:<song amount>`,
                `recent <target user> songs:<song amount>`
            ],
            notes: `If you are listening to a song while invoking this command, it will ` +
            `show your currently listened song as well. The target user must be in the ` +
            `same guild that you are invoking this command into.`,
            aliases: [`r`, `latest`],
            dmAvailable: true,
            requiresNickname: true
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        const songArg = args.findIndex(x => x.startsWith(`s:`) || x.startsWith(`songs:`));
        let user: GuildMember, songLimit: number;
        if (songArg !== -1) {
            if (!songArg && args[1]) {
                await message.reply(`incorrect usage of a command! Correct usage would be:\n` +
                this.usage.map(x => `\`${client.prefix}${x}\``).join(`\n`));
                return;
            }
            if (!isNaN(parseInt(args[songArg].split(`:`)[1]))) {
                songLimit = parseInt(args[songArg].split(`:`)[1]);
                if (songLimit > 10 || songLimit < 1) {
                    await message.reply(`you cannot have more than 10 or less than 1 song.`);
                    return;
                }
            } else {
                songLimit = 5;
            }
            if (args[1]) {
                user = DiscordUserGetter(message, args.slice(0, songArg).join(` `))!;
                if (!user) {
                    await message.reply(snippets.userNotFound);
                    return;
                }
            } else {
                user = message.member;
            }
        } else {
            songLimit = 5;
            if (args.length) {
                user = DiscordUserGetter(message, args.join(` `))!;
                if (!user) {
                    await message.reply(snippets.userNotFound);
                    return;
                }
            } else {
                user = message.member;
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
                .setThumbnail(tracks.track[nowPlaying ? 1 : 0].image[2][`#text`]);
            if (nowPlaying) {
                const album = nowPlaying.album[`#text`] || `no album`;
                const value = `**${nowPlaying.name}** - ${nowPlaying.artist[`#text`]} | ${album}`;
                embed.addField(`Now playing`, value);
            }
            embed.addField(`Previous`, previous)
                .addField(`${username}'s scrobble amount`, userInfo.playcount);
            await message.channel.send(embed);
        } else {
            await message.reply(snippets.userNoLogin);
        }
    }

}

module.exports = RecentCommand;