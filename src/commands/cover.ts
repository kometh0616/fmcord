import CommandParams from "../handler/CommandParams";
import UsernameAndNotDisabled from "../checks/UsernameAndNotDisabled";
import StartTyping from "../hooks/StartTyping";
import PostCheck from "../hooks/PostCheck";
import { Message } from "eris";
import TrackFetcher from "../classes/TrackFetcher";
import snippets from "../snippets";
import Library from "../lib/lastfm";
import { LastFMAlbumInfo } from "../lib/lastfm/typings";
import FMcord from "../handler/FMcord";
import { loadImage, createCanvas } from "canvas";

export default class CoverCommand extends CommandParams {

    public constructor() {
        super(`cover`, {
            description: `Returns a cover of an album.`,
            usage: [
                `cover`,
                `cover <album name>`,
                `cover <album name> a:<artist name>`,
                `cover <album name> artist:<artist name>`
            ].join(`, `),
            aliases: [`co`, `cv`],
            requirements: {
                custom: UsernameAndNotDisabled,
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const client = message.channel.client as FMcord;
        let artistName: string, albumName: string;
        const trackFetcher = new TrackFetcher(client, message);
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
                const canvas = createCanvas(300, 300);
                const ctx = canvas.getContext(`2d`);
                const image = await loadImage(albumInfo.image[3][`#text`]);
                ctx.drawImage(image, 0, 0);
                await message.channel.createMessage(`Album cover for \`${albumInfo.artist} - ${albumInfo.name}\``, { 
                    name: `file.jpg`,
                    file: canvas.toBuffer()
                });
            } else {
                await message.channel.createMessage(`${message.author.mention}, no cover for an album found.`);
            }
        } catch (e) {
            if (e.message === `Album not found`) {
                await message.channel.createMessage(`${message.author.mention}, no album from an artist named ${artistName} with a name ${albumName} found.`);
                return;
            }
        }
    }

}