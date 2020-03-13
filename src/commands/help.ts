import CommandParams from "../handler/CommandParams";
import StartTyping from "../hooks/StartTyping";
import { Message } from "eris";
import FMcord from "../handler/FMcord";
import FMcordEmbed from "../classes/FMcordEmbed";
import CommandEmbed from "../classes/CommandEmbed";
import NotDisabled from "../checks/NotDisabled";
import PostCheck from "../hooks/PostCheck";

export default class HelpCommand extends CommandParams {
    
    public constructor() {
        super(`help`, {
            aliases: [`h`],
            usage: [`help`, `help <command>`, `help --manual`].join(`, `),
            description: `Shows you this help message`,
            requirements: {
                custom: NotDisabled
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const commands = [...Object.values((message.channel.client as FMcord).commands)].filter(x => !x.hidden);
        if (args[0] !== undefined) {
            const name = args[0].toLowerCase();
            const command = commands.find(x => x.label.toLowerCase() === name || x.aliases.map(a => a.toLowerCase()).includes(name));
            if (command === undefined) {
                await message.channel.createMessage(`${message.author.mention}, I couldn't find a command called \`${name}\``);
                return;
            } else {
                const embed = new CommandEmbed(message, command);
                await message.channel.createMessage({ embed });
            }
        } else {
            const commandNames = commands.map(x => `\`${x.label}\``).join(`, `);
            const embed = new FMcordEmbed(message)
                .setTitle(`FMcord's commands`)
                .setThumbnail(message.channel.client.user.avatarURL)
                .setDescription(`Do ${(message.channel.client as FMcord).prefix}help \`<command name>\` to get more information on a command!`)
                .addField(`Available commands`, commandNames);
            await message.channel.createMessage({ embed });
        }
    }

}