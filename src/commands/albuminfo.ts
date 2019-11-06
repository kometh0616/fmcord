import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import Library from "../lib/lastfm";
import TrackFetcher from "../classes/TrackFetcher";
import snippets from "../snippets";
import { LastFMAlbumInfo } from "../lib/lastfm/typings";
import FMcordEmbed from "../classes/FMcordEmbed";

class AlbumInfoCommand extends Command {

    public constructor() {
        super({
            name: `albuminfo`,
            description: `Shows general information about an album.`,
            usage: [
                `albuminfo`,
                `albuminfo <album name>`,
                `albuminfo <album name> a:<artist name>`,
                `albuminfo <album name> artist:<artist name>`
            ],
            notes: `Track hyperlinks may not always work, as the total length of a track name and URL ` +
            `may exceed 1024 character limit.`,
            aliases: [`abi`, `album`],
            dmAvailable: true
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        let artistName: string, albumName: string;
        const trackFetcher = new TrackFetcher(client, message);
        if (args.length) {
            const artistArg = args.findIndex(x => x.startsWith(`a:`) || x.startsWith(`artist:`));
            if (artistArg !== -1) {
                artistName = args.slice(artistArg).join(` `);
                albumName = args.slice(0, artistArg).join(` `);
                artistName = artistName.substring(artistName.startsWith(`a:`) ? 2 : 7);
                if (!albumName.length) {
                    await message.reply(`you must provide an album you want information about.`);
                    return;
                }
            } else {
                const track = await trackFetcher.getCurrentTrack();
                if (track) {
                    artistName = track.artist[`#text`];
                    albumName = args.join(` `);
                } else {
                    await message.reply(snippets.notPlaying);
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
                    await message.reply(`your track is not in an album.`);
                    return;
                }
            } else {
                await message.reply(snippets.notPlaying);
                return;
            }
        }
        const lib = new Library(client.apikeys.lastFM);
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
                embed.addField(`Total duration`, snippets.formatSeconds(totalDuration), true);
            }
            embed
                .addField(`Listeners`, albumInfo.listeners, true)
                .addField(`Playcount`, albumInfo.playcount, true);
            if (albumInfo.userplaycount) {
                embed.addField(`Your playcount`, albumInfo.userplaycount, true);
            }
            if (albumInfo.tags.tag.length) {
                embed.addField(`Tags`, albumInfo.tags.tag.map(x => snippets.clickify(x.name, x.url)).join(` - `), true);
            }
            await message.channel.send(embed);
        } catch (e) {
            if (e.message === `Album not found`) {
                await message.reply(`no album from an artist named ${artistName} with a name ${albumName} found.`);
                return;
            } else {
                throw e;
            }
        }
        
    }

}

module.exports = AlbumInfoCommand;