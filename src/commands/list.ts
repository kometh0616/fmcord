import Command from "../handler/Command";
import * as path from "path";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";

class ListCommand extends Command {
    
    public constructor() {
        super({
            name: `list`,
            description: `Provides you a list of your top songs or artists.`,
            usage: [
                `list <list type>`, 
                `list <list type> <time period>`, 
                `list <list type> <time period> <list length>`,
                `list <list type> <time period> <list length> <user>`
            ],
            notes: `In \`list type\`, you can have \`artists\` or \`songs\`. ` +
            `In \`time period\`, you can have \`weekly\`, \`monthly\` or ` +
            `\`alltime\`. List must not be longer than 25 elements. \`Time period\` ` +
            `and \`list length\` can be omitted, then it defaults to weekly top 10. ` +
            `You can type the first letter of the parameter as a shortcut.`,
            aliases: [`l`, `top`],
            dmAvailable: true,
            subcommandDir: path.join(__dirname, `list`),
            subcommandRequired: true,
            requiresNickname: true
        });
    }

    public async run(client: FMcord, message: Message): Promise<void> {
        await message.reply(`placeholder`);
    }
    
}

module.exports = ListCommand;