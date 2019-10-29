import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message, GuildMember } from "discord.js";
import UserFetcher from "../classes/UserFetcher";
import DiscordUserGetter from "../utils/DiscordUserGetter";

class LastFMCommand extends Command {

    public constructor() {
        super({
            name: `lastfm`,
            description: `Gets the LastFM URL of you or a given user.`,
            usage: [`lastfm, lastfm <discord user>`],
            aliases: [`lfm`],
            notes: `The looked up user must be logged in to LastFM with the bot.`,
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        const userFetcher = new UserFetcher(message);
        let discordUser: GuildMember | null;
        if (args.length) {
            discordUser = DiscordUserGetter(message, args.join(` `));
            if (!discordUser) {
                await message.reply(`\`${args.join(` `)}\` is not a valid user.`);
                return;
            }
        } else {
            discordUser = message.member;
        }
        const user = await userFetcher.usernameFromID(discordUser.id);
        if (user) {
            const URL = `https://last.fm/user/${user}`;
            await message.reply(`${discordUser.user.username}'s\` Last.fm URL: ${URL}`);
        } else {
            await message.reply(`\`${discordUser.user.username}\` does not have a Last.fm account, ` +
            `or has not set their nickname.`);
        }
    }
    
}

module.exports = LastFMCommand;