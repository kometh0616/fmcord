import Subcommand from "../../handler/Subcommand";
import FMcord from "../../handler/FMcord";
import { Message } from "discord.js";
import { Prefixes } from "../../entities/Prefixes";

class PrefixSetSubcommand extends Subcommand {

    public constructor() {
        super({
            name: `set`
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        if (!args.length) {
            await message.reply(`you must provide a prefix!`);
            return;
        }
        const prefix = args[0];
        if (prefix.length < 3 && prefix !== client.defaultPrefix) {
            const hasPrefix = await Prefixes.count({
                guildID: message.guild!.id,
                prefix
            });
            if (hasPrefix) {
                await message.reply(`you already have a prefix set! Please delete your existing ` +
                `prefix in order to set a new one.`);
                return;
            } else {
                const newPrefix = new Prefixes();
                newPrefix.guildID = message.guild!.id;
                newPrefix.prefix = prefix;
                await newPrefix.save();
            }
            await message.reply(`prefix in ${message.guild!.name} has been set to \`${prefix}\` succesfully!`);
        } else if (prefix.length >= 3) {
            await message.reply(`your prefix is too long! It cannot be longer than 2 symbols.`);
        } else if (prefix === client.defaultPrefix) {
            await message.reply(`you can't have a default prefix as a custom prefix, that's illogical.`);
        }
    }

}

module.exports = PrefixSetSubcommand;