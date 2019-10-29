import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import snippets from "../snippets";

class InviteCommand extends Command {

    public constructor() {
        super({
            name: `invite`,
            description: `Sends you a bot invitation link, by which you can invite this ` +
            `bot to your server.`,
            usage: [`invite`],
            aliases: [`inv`, `botinvite`],
            dmAvailable: true,
        });
    }

    public async run(client: FMcord, message: Message): Promise<void> {
        await message.reply(`you can invite me to your server using this link: ${snippets.dBotsLink}`);
    }

}

module.exports = InviteCommand;