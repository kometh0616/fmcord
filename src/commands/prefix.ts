import CommandParams from "../handler/CommandParams";
import { Message } from "eris";
import { Prefixes } from "../entities/Prefixes";
import FMcord from "../handler/FMcord";
import StartTyping from "../hooks/StartTyping";
import NotDisabled from "../checks/NotDisabled";
import PostCheck from "../hooks/PostCheck";

export default class PrefixCommand extends CommandParams {

    public constructor() {
        super(`prefix`, {
            description: `Configures prefix in the guild.`,
            usage: [`prefix set <prefix>`, `prefix delete`].join(`, `),
            fullDescription: `This command requires Manage Server permission. Can be overriden ` +
            `if you have Administrator permissions, or if you are an owner of the guild.\n` +
            `Prefix must not be longer than 2 symbols and must not contain whitespace. ` +
            `For example, \`f/\` would be a valid prefix, while \`===\` and \`+ +\` ` +
            `would be not.`,
            requirements: {
                custom: NotDisabled
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            }
        });
    }

    public async execute(message: Message): Promise<void> {
        const client = message.channel.client as FMcord;
        const hasPrefix = await Prefixes.findOne({
            guildID: message.guildID
        });
        if (hasPrefix !== undefined) {
            await message.channel.createMessage(`${message.author.mention}, prefix in this guild is \`${hasPrefix.prefix}\`.`);
        } else {
            await message.channel.createMessage(`${message.author.mention}, no prefix for this guild is set. To set a prefix, do ` +
            `\`${client.prefix}prefix set <prefix>\`.`);
        }
    }

}