import Subcommand from "../../handler/Subcommand";
import FMcord from "../../handler/FMcord";
import { Message } from "discord.js";
import { Prefixes } from "../../entities/Prefixes";

class PrefixDeleteSubcommand extends Subcommand {

    public constructor() {
        super({
            name: `delete`
        });
    }

    public async run(client: FMcord, message: Message): Promise<void> {
        const hasPrefix = await Prefixes.count({
            guildID: message.guild!.id
        });
        if (hasPrefix) {
            await Prefixes.delete({
                guildID: message.guild!.id
            });
            await message.reply(`prefix${hasPrefix > 2 ? `es` : ``} ha${hasPrefix > 2 ? `ve` : `s`} been ` +
            `removed succesfully!`);
        } else {
            await message.reply(`no prefix found. No changes were made.`);
        }
    }

}

module.exports = PrefixDeleteSubcommand;