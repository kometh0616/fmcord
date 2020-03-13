import CommandParams from "../handler/CommandParams";
import StartTyping from "../hooks/StartTyping";
import NotDisabled from "../checks/NotDisabled";
import { Message } from "eris";
import FMcord from "../handler/FMcord";
import { Disables } from "../entities/Disables";
import Spotify from "../lib/spotify";
import TrackFetcher from "../classes/TrackFetcher";

export default class SpotifyCommand extends CommandParams {

    public constructor() {
        super(`spotify`, {
            description: `Gets a link of a song from Spotify. If no song is provided, ` +
            `the bot will try to get your currently played track.`,
            usage: [`spotify <song name>`, `spotify`].join(`, `),
            aliases: [`sp`],
            hooks: {
                async postCheck(message: Message, args: string[], checksPassed: boolean): Promise<void> {
                    if (!checksPassed) {
                        const client = message.channel.client as FMcord;
                        const { spotify } = client.apikeys;
                        if (spotify?.id === undefined || spotify?.secret === undefined) {
                            message.channel.createMessage(`${message.author.mention}, some of the Spotify API credentials are missing, ` +
                            `therefore, this command cannot be used. Please contact the maintainer ` +
                            `of this bot.`);
                        } else {
                            const isDisabled = await Disables.findOne({
                                where: [
                                    { discordID: message.channel.id, cmdName: message.command?.label },
                                    { discordID: message.guildID, cmdName: message.command?.label }
                                ]
                            });
            
                            if (isDisabled !== undefined) {
                                const guildDisabled = isDisabled.discordID === message.guildID;
                                await message.channel.createMessage(`${message.author.mention}, command \`${message.command?.label}\` is disabled in ${guildDisabled ? message.member!.guild.name : `this channel`}`);
                            }
                        }
                    }
                },
                preCommand: StartTyping
            },
            requirements: {
                async custom(message: Message): Promise<boolean> {
                    const client = message.channel.client as FMcord;
                    const { spotify } = client.apikeys;
                    return spotify?.id !== undefined && spotify?.secret !== undefined && await NotDisabled(message);
                }
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const client = message.channel.client as FMcord;
        const { spotify } = client.apikeys;
        const lib = new Spotify(spotify!.id, spotify!.secret);
        if (args.length) {
            const track = await lib.findTrack(args.join(` `));
            if (track.tracks.items[0]) {
                await message.channel.createMessage(track.tracks.items[0].external_urls.spotify);
            } else {
                await message.channel.createMessage(`${message.author.mention}, nothing found when looking for \`${args.join(` `)}\``);
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
                    await message.channel.createMessage(track.tracks.items[0].external_urls.spotify);
                } else {
                    await message.channel.createMessage(`${message.author.mention}, your listened track wasn't found on Spotify.`);
                }
            }
        }
    }

}