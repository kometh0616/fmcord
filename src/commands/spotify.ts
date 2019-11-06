import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import Spotify from "../lib/spotify";
import TrackFetcher from "../classes/TrackFetcher";

class SpotifyCommand extends Command {

    public constructor() {
        super({
            name: `spotify`,
            description: `Gets a link of a song from Spotify. If no song is provided, ` +
            `the bot will try to get your currently played track.`,
            usage: [`spotify <song name>`, `spotify`],
            aliases: [`sp`],
            dmAvailable: true
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        const { spotify } = client.apikeys;
        if (spotify && spotify.id && spotify.secret) {
            const lib = new Spotify(spotify.id, spotify.secret);
            if (args.length) {
                const track = await lib.findTrack(args.join(` `));
                if (track.tracks.items[0]) {
                    await message.channel.send(track.tracks.items[0].external_urls.spotify);
                } else {
                    await message.reply(`nothing found when looking for \`${args.join(` `)}\``);
                }
            } else {
                const trackFetcher = new TrackFetcher(client, message);
                let song = await trackFetcher.getCurrentTrack();
                if (!song) {
                    song = await trackFetcher.getLatestTrack();
                }
                if (song) {
                    const track = await lib.findTrack(`${song.name} ${song.artist[`#text`]}`);
                    if (track.tracks.items[0]) {
                        await message.channel.send(track.tracks.items[0].external_urls.spotify);
                    } else {
                        await message.reply(`your listened track wasn't found on Spotify.`);
                    }
                }
            }
        } else {
            await message.reply(`some of the Spotify API credentials are missing, ` +
            `therefore, this command cannot be used. Please contact the maintainer ` +
            `of this bot.`);
        }
    }

}

module.exports = SpotifyCommand;