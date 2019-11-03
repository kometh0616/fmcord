import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import TrackFetcher from "../classes/TrackFetcher";
import snippets from "../snippets";
import Library from "../lib/lastfm";
import { LastFMAlbumInfo } from "../lib/lastfm/typings";

class CoverCommand extends Command {

    public constructor() {
        super({
            name: `cover`,
            description: `Returns a cover of an album.`,
            usage: [
                `cover`,
                `cover <album name>`,
                `cover <album name> a:<artist name>`,
                `cover <album name> artist:<artist name>`
            ],
            aliases: [`co`, `cv`],
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
            if (albumInfo.image[3]) {
                await message.channel.send(`Album cover for \`${albumInfo.artist} - ${albumInfo.name}\``, { 
                    files: [albumInfo.image[3][`#text`]] 
                });
            } else {
                await message.reply(`no cover for an album found.`);
            }
        } catch (e) {
            if (e.message === `Album not found`) {
                await message.reply(`no album from an artist named ${artistName} with a name ${albumName} found.`);
                return;
            }
        }
    }

}

module.exports = CoverCommand;