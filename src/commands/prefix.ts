import Command from "../handler/Command";
import * as path from "path";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import { Prefixes } from "../entities/Prefixes";

class PrefixCommand extends Command {

    public constructor() {
        super({
            name: `prefix`,
            description: `Configures prefix in the guild.`,
            usage: [`prefix set <prefix>`, `prefix delete`],
            notes: `This command requires Manage Server permission. Can be overriden ` +
            `if you have Administrator permissions, or if you are an owner of the guild.\n` +
            `Prefix must not be longer than 2 symbols and must not contain whitespace. ` +
            `For example, \`f/\` would be a valid prefix, while \`===\` and \`+ +\` ` +
            `would be not.`,
            permissions: {
                user: `MANAGE_GUILD`
            },
            subcommandDir: path.join(__dirname, `prefix`)
        });
    }

    public async run(client: FMcord, message: Message): Promise<void> {
        const hasPrefix = await Prefixes.findOne({
            guildID: message.guild!.id
        });
        if (hasPrefix) {
            await message.reply(`prefix in this guild is \`${hasPrefix.prefix}\`. You can always ` +
            `use the default prefix of this bot, which is \`${client.defaultPrefix}\`.`);
        } else {
            await message.reply(`no prefix for this guild is set. To set a prefix, do ` +
            `\`${client.defaultPrefix}prefix set <prefix>\`.`);
        }
    }

}

module.exports = PrefixCommand;