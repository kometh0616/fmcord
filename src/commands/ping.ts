import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";

class PingCommand extends Command {

    constructor() {
        super({
            name: `ping`,
            description: `Tells you your ping.`,
            usage: [`ping`]
        });
    }

    public run = async (client: FMcord, message: Message, args: string[]): Promise<void> => {
        const oldDate: number = Date.now();
        const msg: Message = await message.channel.send(`Pong!`) as Message;
        const newDate: number = Date.now() - oldDate;
        await msg.edit(`Pong! Your ping is ${newDate}ms.`);
    }
}

module.exports = PingCommand;