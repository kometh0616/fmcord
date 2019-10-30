import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import UserFetcher from "../classes/UserFetcher";
import TrackFetcher from "../classes/TrackFetcher";
import snippets from "../snippets";
import YouTubeRequest from "../classes/YouTubeRequest";

class YouTubeCommand extends Command {

    public constructor() {
        super({
            name: `youtube`,
            description: `Gets a YouTube link of a searched song or video. If no ` +
            `query is specified, it looks at what you're playing right now.`,
            usage: [`youtube`, `youtube <search query>`],
            aliases: [`yt`],
            dmAvailable: true,
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        if (client.apikeys.youtube) {
            let query: string;
            if (args.length) {
                query = args.join(` `);
            } else {
                const trackFetcher = new TrackFetcher(client, message);
                const username = await trackFetcher.username();
                if (username) {
                    const data = await trackFetcher.getCurrentTrack();
                    if (data) {
                        query = `${data.name} ${data.artist[`#text`]}`;
                    } else {
                        await message.reply(snippets.notPlaying);
                        return;
                    }
                } else {
                    await message.reply(snippets.npNoLogin);
                    return;
                }
            }
            const yt = new YouTubeRequest(client.apikeys.youtube);
            const data = await yt.search(query);
            const result = data.items[0];
            if (result) {
                await message.reply(`result for query \`${query}\`: https://youtu.be/${result.id.videoId}`);
            } else {
                await message.reply(`no results found on query \`${query}\`.`);
            }
        } else {
            await message.reply(`this bot is not supplied with a YouTube API key, ` +
            `therefore, this command cannot be executed. Please contact the developer ` +
            `of this bot.`);
        }
    }

}

module.exports = YouTubeCommand;