import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import { LastFMUserRecentTrack, LastFMArtistInfo } from "../lib/lastfm/typings";
import TrackFetcher from "../classes/TrackFetcher";
import snippets from "../snippets";
import Library from "../lib/lastfm";
import FMcordEmbed from "../classes/FMcordEmbed";

class ArtistInfoCommand extends Command {

    public constructor() {
        super({
            name: `artistinfo`,
            description: `Returns information about a provided artist.`,
            usage: [`artistinfo`, `artistinfo <artist name>`],
            aliases: [`ai`],
            dmAvailable: true
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        const trackFetcher = new TrackFetcher(client, message);
        const lib = new Library(client.apikeys.lastFM);
        const track: LastFMUserRecentTrack | null = await trackFetcher.getCurrentTrack();
        let artistName = ``;
        if (!track && !args.length) {
            await message.reply(snippets.notPlaying);
            return;
        } else if (track) {
            artistName = track.artist[`#text`];
        } else {
            artistName = args.join(` `);
        }
        let data: LastFMArtistInfo;
        const username: string | null = await trackFetcher.username();
        if (username) {
            data = await lib.artist.getInfo(artistName, {
                username
            });
        } else {
            data = await lib.artist.getInfo(artistName);
        }
        const embed = new FMcordEmbed(message)
            .setTitle(`Information about ${data.name}`)
            .setURL(data.url)
            .addField(`Listeners`, data.stats.listeners, true)
            .addField(`Scrobbles`, data.stats.playcount, true);
        if (data.tags.tag.length > 0) {
            embed.addField(`Tags`, data.tags.tag.map(x => `[${x.name}](${snippets.removeParens(x.url)})`).join(` - `), true);
        }
        if (data.stats.userplaycount) {
            embed.addField(`User play count: `, data.stats.userplaycount, true);
        }
        const href = `<a href="${data.url}">Read more on Last.fm</a>`;
        const desc = data.bio.summary.slice(0, data.bio.summary.length - href.length - 1);
        if (desc.length > 0) {
            embed.addField(`Summary`, snippets.truncate(desc), true);
        }
        await message.channel.send(embed);
    }

}

module.exports = ArtistInfoCommand;