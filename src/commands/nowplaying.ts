import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message, GuildMember } from "discord.js";
import Library from "../lib/lastfm";
import TrackFetcher from "../classes/TrackFetcher";
import FMcordEmbed from "../classes/FMcordEmbed";
import snippets from "../snippets";
import DiscordUserGetter from "../utils/DiscordUserGetter";

class NowPlayingCommand extends Command {

    public constructor() {
        super({
            name: `nowplaying`,
            description: `Shows you a song you are listening to right now.`,
            usage: [`nowplaying`],
            aliases: [`np`, `current`],
            dmAvailable: true,
            requiresNickname: true
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        const lib = new Library(client.apikeys.lastFM);
        const trackFetcher = new TrackFetcher(client, message);
        let username: string | null;
        let user: GuildMember | null = null;
        if (args.length) {
            user = DiscordUserGetter(message, args.join(` `));
            if (user) {
                username = await trackFetcher.usernameFromID(user.id);
            } else {
                await message.reply(snippets.userNotFound);
                return;
            }
        } else {
            username = await trackFetcher.username();
        }
        if (username) {
            const currentTrack = await trackFetcher.getCurrentTrack(username);
            if (currentTrack) {
                const lastTrack = await trackFetcher.getLatestTrack(username);
                const userData = await lib.user.getInfo(username);
                const currentAlbum = currentTrack.album[`#text`] || `no album`;
                const lastAlbum = lastTrack!.album[`#text`] || `no album`;
                const embed = new FMcordEmbed(message)
                    .addField(`Current`, `**${currentTrack.name}** - ${currentTrack.artist[`#text`]} | ${currentAlbum}`)
                    .addField(`Previous`, `**${lastTrack!.name}** - ${lastTrack!.artist[`#text`]} | ${lastAlbum}`)
                    .addField(`Total scrobbles`, userData.playcount)
                    .setTitle(`Current track for ${userData.name} (${user?.user.tag ?? message.author.tag})`)
                    .setURL(userData.url)
                    .setThumbnail(currentTrack.image[2][`#text`]);
                await message.channel.send(embed);
            } else if (args.length) {
                await message.reply(`the target user is not listening to anything right now.`);
            } else {
                await message.reply(snippets.notPlaying);
            }
        } else if (args.length) {
            await message.reply(snippets.userNoLogin);
        }
    }

}

module.exports = NowPlayingCommand;