import CommandParams from "../../handler/CommandParams";
import { Message } from "eris";
import { Prefixes } from "../../entities/Prefixes";
import StartTyping from "../../hooks/StartTyping";
import PostCheck from "../../hooks/PostCheck";
import NotDisabled from "../../checks/NotDisabled";
import FMcord from "../../handler/FMcord";

export default class DeleteSubcommand extends CommandParams {

    public constructor() {
        super(`delete`, {
            guildOnly: true,
            requirements: {
                permissions: {
                    manageGuild: true,
                },
                custom: NotDisabled
            },
            permissionMessage: (message: Message) => `${message.author.mention}, you do not have a permission \`Manage Guild\` to execute this command.`,
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            }
        });
    }

    public async execute(message: Message): Promise<void> {
        const client = message.channel.client as FMcord;
        const hasPrefix = await Prefixes.count({
            guildID: message.guildID
        });
        if (hasPrefix) {
            await Prefixes.delete({
                guildID: message.guildID
            });
            delete client.guildPrefixes[message.guildID!];
            await message.channel.createMessage(`${message.author.mention}, prefix has been removed succesfully!`);
        } else {
            await message.channel.createMessage(`${message.author.mention}, no prefix found. No changes were made.`);
        }
    }

}