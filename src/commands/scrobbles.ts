import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import DiscordUserGetter from "../utils/DiscordUserGetter";
import UserFetcher from "../classes/UserFetcher";
import snippets from "../snippets";
import FMcordEmbed from "../classes/FMcordEmbed";
import Library from "../lib/lastfm";

class UserInfoCommand extends Command {

    public constructor() {
        super({
            name: `scrobbles`,
            description: `Tells you a user's total scrobble amount.`,
            usage: [`scrobbles`, `scrobbles <user>`],
            aliases: [`s`],
            dmAvailable: true,
            requiresNickname: true
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        const userFetcher = new UserFetcher(message);
        let username: string | null;
        if (args.length) {
            const user = DiscordUserGetter(message, args.join(` `));
            if (user) {
                username = await userFetcher.usernameFromID(user.id);
                if (!username) {
                    await message.reply(snippets.userNoLogin);
                    return;
                }
            } else {
                await message.reply(snippets.userNotFound);
                return;
            }
        } else {
            username = await userFetcher.username();
        }
        if (username) {
            const lib = new Library(client.apikeys.lastFM);
            const user = await lib.user.getInfo(username);
            await message.reply(`**${user.name}'s** scrobble amount is \`${user.playcount}\`.`);
        } else {
            await message.reply(snippets.noLogin);
        }
    }

}

module.exports = UserInfoCommand;