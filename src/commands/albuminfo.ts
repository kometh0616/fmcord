import CommandParams from "../handler/CommandParams";
import { Message } from "eris";
import TrackFetcher from "../classes/TrackFetcher";
import snippets from "../snippets";
import Library from "../lib/lastfm";
import { LastFMAlbumInfo } from "../lib/lastfm/typings";
import FMcordEmbed from "../classes/FMcordEmbed";
import FMcord from "../handler/FMcord";
import PostCheck from "../hooks/PostCheck";
import StartTyping from "../hooks/StartTyping";
import UsernameAndNotDisabled from "../checks/UsernameAndNotDisabled";

export default class AlbumInfoCommand extends CommandParams {

    public constructor() {
        super(`albuminfo`, {
            description: `Shows general information about an album.`,
            usage: [
                `albuminfo`,
                `albuminfo <album name>`,
                `albuminfo <album name> a:<artist name>`,
                `albuminfo <album name> artist:<artist name>`
            ].join(`, `),
            fullDescription: `Track hyperlinks may not always work, as the total length of a track name and URL ` +
            `may exceed 1024 character limit.`,
            aliases: [`abi`, `album`],
            requirements: {
                custom: UsernameAndNotDisabled
            },
            hooks: {
                postCheck: PostCheck,
                preCommand: StartTyping
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        let artistName: string, albumName: string;
        const trackFetcher = new TrackFetcher(message.channel.client as FMcord, message);
        if (args.length) {
            const artistArg = args.findIndex(x => x.startsWith(`a:`) || x.startsWith(`artist:`));
            if (artistArg !== -1) {
                artistName = args.slice(artistArg).join(` `);
                albumName = args.slice(0, artistArg).join(` `);
                artistName = artistName.substring(artistName.startsWith(`a:`) ? 2 : 7);
                if (!albumName.length) {
                    await message.channel.createMessage(`${message.author.mention}, you must provide an album you want information about.`);
                    return;
                }
            } else {
                const track = await trackFetcher.getCurrentTrack();
                if (track) {
                    artistName = track.artist[`#text`];
                    albumName = args.join(` `);
                } else {
                    await message.channel.createMessage(`${message.author.mention}, ${snippets.notPlaying}`);
                    return;
                }
            }
        } else {
            const track = await trackFetcher.getCurrentTrack();
            if (track) {
                if (track.album[`#text`].length) {
                    artistName = track.artist[`#text`];
                    albumName = track.album[`#text`];
                } else {
                    await message.channel.createMessage(`${message.author.mention}, your track is not in an album.`);
                    return;
                }
            } else {
                await message.channel.createMessage(`${message.author.mention}, ${snippets.notPlaying}`);
                return;
            }
        }
        const lib = new Library((message.channel.client as FMcord).apikeys.lastFM);
        const username = await trackFetcher.username();
        let albumInfo: LastFMAlbumInfo;
        try {
            if (username) {
                albumInfo = await lib.album.getInfo(artistName, albumName, { username });
            } else {
                albumInfo = await lib.album.getInfo(artistName, albumName);
            }
            const totalDuration: string = albumInfo.tracks.track.map(x => parseInt(x.duration))
                .reduce((acc, prev) => acc + prev, 0)
                .toString();
            let num = 0;
            const hyperlinks = albumInfo.tracks.track.map(x => snippets.clickify(`${++num}. ${x.name} ${snippets.formatSeconds(x.duration)}`, x.url)).join(`\n`);
            num = 0;
            const plainText = albumInfo.tracks.track.map(x => `${++num}. ${x.name} ${snippets.formatSeconds(x.duration)}`).join(`\n`);
            const embed = new FMcordEmbed(message)
                .setTitle(`Information about ${albumInfo.name} by ${albumInfo.artist}`)
                .setURL(albumInfo.url)
                .setThumbnail(albumInfo.image[2][`#text`]);
            if (albumInfo.tracks.track.length) {
                embed.addField(`Artist`, snippets.clickify(albumInfo.artist, albumInfo.tracks.track[0].artist.url), true)
                    .addField(`Tracks`, hyperlinks.length < 1024 ? hyperlinks : plainText);
            }
            if (totalDuration !== `0`) {
                embed.addField(`Total duration`, snippets.formatSeconds(totalDuration));
            }
            embed
                .addField(`Listeners`, albumInfo.listeners)
                .addField(`Playcount`, albumInfo.playcount);
            if (albumInfo.userplaycount) {
                embed.addField(`Your playcount`, albumInfo.userplaycount);
            }
            if (albumInfo.tags.tag.length) {
                embed.addField(`Tags`, albumInfo.tags.tag.map(x => snippets.clickify(x.name, x.url)).join(` - `));
            }
            await message.channel.createMessage({ embed });
        } catch (e) {
            if (e.message === `Album not found`) {
                await message.channel.createMessage(`${message.author.mention}, no album from an artist named ${artistName} with a name ${albumName} found.`);
                return;
            } else {
                throw e;
            }
        }
    }

}