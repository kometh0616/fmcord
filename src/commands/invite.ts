import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";

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
        const invite = await client.generateInvite([
            `SEND_MESSAGES`,
            `EMBED_LINKS`,
            `ATTACH_FILES`,
            `ADD_REACTIONS`
        ]);
        await message.reply(`you can invite me to your server using this link: ${invite}`);
    }

}

module.exports = InviteCommand;