import CommandParams from "../handler/CommandParams";
import StartTyping from "../hooks/StartTyping";
import { Message } from "eris";
import TrackFetcher from "../classes/TrackFetcher";
import Library from "../lib/lastfm";
import { LastFMUserRecentTrack, LastFMArtistInfo } from "../lib/lastfm/typings";
import snippets from "../snippets";
import FMcordEmbed from "../classes/FMcordEmbed";
import FMcord from "../handler/FMcord";

export default class ArtistInfoCommand extends CommandParams {

    public constructor() {
        super(`artistinfo`, {
            description: `Returns information about a provided artist.`,
            fullDescription: `Album hyperlinks may not always work if the track names are too long.`,
            usage: [`artistinfo`, `artistinfo <artist name>`].join(`, `),
            aliases: [`ai`],
            hooks: {
                preCommand: StartTyping
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const trackFetcher = new TrackFetcher(message.channel.client as FMcord, message);
        const lib = new Library((message.channel.client as FMcord).apikeys.lastFM);
        const track: LastFMUserRecentTrack | null = await trackFetcher.getCurrentTrack();
        let artistName = ``;
        if (!track && !args.length) {
            await message.channel.createMessage(`${message.author.mention}, ${snippets.notPlaying}`);
            return;
        } else if (track && !args.length) {
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
        const albumData = await lib.artist.getTopAlbums(artistName);
        const embed = new FMcordEmbed(message)
            .setTitle(`Information about ${data.name}`)
            .setURL(data.url)
            .addField(`Listeners`, data.stats.listeners)
            .addField(`Scrobbles`, data.stats.playcount);
        if (data.tags.tag.length > 0) {
            embed.addField(`Tags`, data.tags.tag.map(x => snippets.clickify(x.name, x.url)).join(` - `));
        }
        if (data.stats.userplaycount) {
            embed.addField(`User play count: `, data.stats.userplaycount);
        }
        const href = `<a href="${data.url}">Read more on Last.fm</a>`;
        const desc = data.bio.summary.slice(0, data.bio.summary.length - href.length - 1);
        if (desc.length > 0) {
            embed.addField(`Summary`, snippets.truncate(desc));
        }
        const albumArray = albumData.album.filter(x => x.name !== `(null)`).slice(0, 8);
        if (albumArray.length > 0) {
            let num = 0;
            const withHyperlinks = albumArray.map(album => snippets.clickify(`${++num}. ${album.name}`, album.url)).join(`\n`);
            let albumList: string;
            if (withHyperlinks.length <= 1024) {
                albumList = withHyperlinks;
            } else {
                num = 0;
                albumList = albumArray.map(album => `${++num}. ${album.name}`).join(`\n`);
            }
            embed.addField(`Top ${albumArray.length} albums`, albumList);
        }
        await message.channel.createMessage({ embed });
    }

}