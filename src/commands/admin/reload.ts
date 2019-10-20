import Subcommand from "../../handler/Subcommand";
import FMcord from "../../handler/FMcord";
import { Message } from "discord.js";
import * as path from "path";

class ReloadSubcommand extends Subcommand {

    public constructor() {
        super({
            name: `reload`,
            aliases: [`r`],
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        if (!args[0]) {
            message.reply(`no command provided!`);
        } else {
            const cmdName: string = args[0];
            if (client.commands.some(x => x.name === cmdName || x.aliases && x.aliases.includes(cmdName))) {
                const dir = path.join(__dirname, `${cmdName}.js`);
                delete require.cache[require.resolve(dir)];
                client.commands.splice(0, client.commands.length, ...client.commands.filter(x => x.name !== cmdName));
                const props = require(dir);
                client.commands.push(new props());
                await message.reply(`command ${cmdName} has been reloaded succesfully!`);
            } else {
                await message.reply(`no command with name ${cmdName} found.`);
            }
        }
    }

}

module.exports = ReloadSubcommand;