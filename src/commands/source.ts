import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message } from "discord.js";
import snippets from "../snippets";

class SourceCommand extends Command {

    public constructor() {
        super({
            name: `source`,
            description: `Sends you a link to FMcord's GitHub repository. If a command ` +
            `name is provided, links you to the source of the provided command.`,
            usage: [`source`, `source <command name>`],
            notes: `You must provide a full command name, not a shortcut.`,
            aliases: [`src`],
            dmAvailable: true,
        });
    }

    public async run(client: FMcord, message: Message, args: string[]): Promise<void> {
        if (args.length) {
            const cmd = args[0].toLowerCase();
            const command = client.commands.find(x => x.name === cmd || x.aliases && x.aliases.includes(cmd));
            if (command) {
                const { name } = command;
                await message.reply(`Here is a source to a command \`${name}\`: ${snippets.getSource(name)}`);
            } else {
                await message.reply(`I can't find a command, called \`${cmd}\`.`);
            }
        } else {
            await message.reply(`here is FMcord's GitHub repository: ${snippets.github}`);
        }
    }

}

module.exports = SourceCommand;