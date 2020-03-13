import CommandParams from "../handler/CommandParams";
import NotDisabled from "../checks/NotDisabled";
import StartTyping from "../hooks/StartTyping";
import PostCheck from "../hooks/PostCheck";
import { Message } from "eris";
import TrackFetcher from "../classes/TrackFetcher";
import snippets from "../snippets";
import Library from "../lib/lastfm";
import { LastFMTrackInfo } from "../lib/lastfm/typings";
import FMcordEmbed from "../classes/FMcordEmbed";
import FMcord from "../handler/FMcord";

export default class TrackInfoCommand extends CommandParams {

    public constructor() {
        super(`trackinfo`, {
            description: `Shows general information about a track.`,
            usage: [
                `trackinfo`,
                `trackinfo <track name>`,
                `trackinfo <track name> a:<artist name>`,
                `trackinfo <track name> artist:<artist name>`
            ].join(`, `),
            aliases: [`ti`, `track`],
            requirements: {
                custom: NotDisabled,
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck,
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const client = message.channel.client as FMcord;
        let artistName: string, trackName: string;
        const trackFetcher = new TrackFetcher(client, message);
        if (args.length) {
            const artistArg = args.findIndex(x => x.startsWith(`a:`) || x.startsWith(`artist:`));
            if (artistArg !== -1) {
                artistName = args.slice(artistArg).join(` `);
                trackName = args.slice(0, artistArg).join(` `);
                artistName = artistName.substring(artistName.startsWith(`a:`) ? 2 : 7);
                if (!trackName.length) {
                    await message.channel.createMessage(`${message.author.mention}, you must provide a track you want information about.`);
                    return;
                }
            } else {
                const track = await trackFetcher.getCurrentTrack();
                if (track) {
                    artistName = track.artist[`#text`];
                    trackName = args.join(` `);
                } else {
                    await message.channel.createMessage(`${message.author.mention}, ${snippets.notPlaying}`);
                    return;
                }
            }
        } else {
            const track = await trackFetcher.getCurrentTrack();
            if (track) {
                artistName = track.artist[`#text`];
                trackName = track.name;
            } else {
                await message.channel.createMessage(`${message.author.mention}, ${snippets.notPlaying}`);
                return;
            }
        }
        const lib = new Library(client.apikeys.lastFM);
        const username = await trackFetcher.username();
        let trackInfo: LastFMTrackInfo;
        if (username) {
            trackInfo = await lib.track.getInfo(artistName, trackName, { username });
        } else {
            trackInfo = await lib.track.getInfo(artistName, trackName);
        }
        const embed = new FMcordEmbed(message)
            .setTitle(`Information about ${trackInfo.name} by ${trackInfo.artist.name}`)
            .setURL(trackInfo.url);
        if (trackInfo.album) {
            embed.setThumbnail(trackInfo.album.image[2][`#text`])
                .addField(`Album`, snippets.clickify(trackInfo.album.title, trackInfo.album.url));
        }
        embed.addField(`Artist`, snippets.clickify(trackInfo.artist.name, trackInfo.artist.url))
            .addField(`Plays`, trackInfo.playcount)
            .addField(`Listeners`, trackInfo.listeners);
        if (trackInfo.userplaycount) {
            embed.addField(`Your plays of the track`, trackInfo.userplaycount);
        }
        if (trackInfo.toptags.tag.length) {
            embed.addField(`Tags`, trackInfo.toptags.tag.map(x => snippets.clickify(x.name, x.url)).join(` - `));
        }
        if (trackInfo.wiki) {
            embed.addField(`About the track`, snippets.truncate(trackInfo.wiki.content));
        }
        await message.channel.createMessage({ embed });
    }

}