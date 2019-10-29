import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import Library from "../lib/lastfm";
import TrackFetcher from "../classes/TrackFetcher";
import FMcordEmbed from "../classes/FMcordEmbed";
import snippets from "../snippets";

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

    public async run(client: FMcord, message: Message): Promise<void> {
        const lib = new Library(client.apikeys.lastFM);
        const trackFetcher = new TrackFetcher(client, message);
        const username = await trackFetcher.username();
        if (username) {
            const currentTrack = await trackFetcher.getCurrentTrack();
            if (currentTrack) {
                const lastTrack = await trackFetcher.getLatestTrack();
                const userData = await lib.user.getInfo(username);
                const currentAlbum = currentTrack.album[`#text`] || `no album`;
                const lastAlbum = lastTrack!.album[`#text`] || `no album`;
                const embed = new FMcordEmbed(message)
                    .addField(`Current`, `**${currentTrack.name}** - ${currentTrack.artist[`#text`]} | ${currentAlbum}`)
                    .addField(`Previous`, `**${lastTrack!.name}** - ${lastTrack!.artist[`#text`]} | ${lastAlbum}`)
                    .addField(`Total scrobbles`, userData.playcount)
                    .setTitle(`Currently listened track by ${userData.name} (${message.author.tag})`)
                    .setURL(userData.url)
                    .setThumbnail(currentTrack.image[2][`#text`]);
                await message.channel.send(embed);
            } else {
                await message.reply(snippets.notPlaying);
            }
        }
    }

}

module.exports = NowPlayingCommand;