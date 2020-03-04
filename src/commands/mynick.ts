import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import UserFetcher from "../classes/UserFetcher";

class MyNickCommand extends Command {
    
    public constructor() {
        super({
            name: `mynick`,
            description: `Shows you your nickname, if any is set`,
            usage: [`mynick`],
            aliases: [`mylogin`],
            dmAvailable: true,
            requiresNickname: true
        });
    }

    public async run(client: FMcord, message: Message): Promise<void> {
        const userFetcher = new UserFetcher(message);
        const user: string | null = await userFetcher.username();
        await message.reply(`your username is \`${user}\`.`);
    }

}

module.exports = MyNickCommand;