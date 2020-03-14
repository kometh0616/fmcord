import CommandParams from "../handler/CommandParams";
import NotDisabled from "../checks/NotDisabled";
import StartTyping from "../hooks/StartTyping";
import PostCheck from "../hooks/PostCheck";
import { Message } from "eris";
import FMcord from "../handler/FMcord";
import snippets from "../snippets";

export default class SourceCommand extends CommandParams {

    public constructor() {
        super(`source`, {
            description: `Sends you a link to FMcord's GitHub repository. If a command ` +
            `name is provided, links you to the source of the provided command.`,
            usage: [`source`, `source <command name>`].join(`, `),
            aliases: [`src`],
            requirements: {
                custom: NotDisabled,
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const client = message.channel.client as FMcord;
        const commands = [...Object.values(client.commands)];
        if (args.length) {
            const cmd = args[0].toLowerCase();
            const command = commands.find(x => x.label === cmd || x.aliases.includes(cmd));
            if (command) {
                const { label } = command;
                await message.channel.createMessage(`${message.author.mention}, here is a source to a command \`${label}\`: ${snippets.getSource(label)}`);
            } else {
                await message.channel.createMessage(`${message.author.mention}, I can't find a command, called \`${cmd}\`.`);
            }
        } else {
            await message.channel.createMessage(`${message.author.mention}, here is FMcord's GitHub repository: ${snippets.github}`);
        }
    }

}