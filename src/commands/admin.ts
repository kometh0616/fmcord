import Command from "../handler/Command";
import * as path from "path";
import { Message } from "discord.js";
import FMcord from "../handler/FMcord";

class AdminCommand extends Command {

    public constructor() {
        super({
            name: `admin`,
            description: `Hidden admin commands only a bot owner is meant to use.`,
            usage: [],
            helpExempt: true,
            ownerOnly: true,
            aliases: [`a`],
            subcommandDir: path.join(__dirname, `admin`),
            subcommandRequired: true
        });
    }

    public async run(client: FMcord, message: Message): Promise<void> {
        await message.reply(`placeholder`);
    }
    
}

module.exports = AdminCommand;