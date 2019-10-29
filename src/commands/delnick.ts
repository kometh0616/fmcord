import Command from "../handler/Command";
import { Message } from "discord.js";
import FMcord from "../handler/FMcord";
import { Users } from "../entities/Users";

class DelnickCommand extends Command {
    
    public constructor() {
        super({
            name: `delnick`,
            description: `Removes your nickname from the bot's database.`,
            usage: [`delnick`],
            aliases: [`logout`],
            dmAvailable: true,
            requiresNickname: true
        });
    }

    public async run(client: FMcord, message: Message): Promise<void> {
        await Users.delete({
            discordUserID: message.author.id
        });
        await message.reply(`your nickname deleted succesfully!`);
    }

}

module.exports = DelnickCommand;