import CommandParams from "../../handler/CommandParams";
import { Message } from "eris";
import AdminCommandCheck from "../../hooks/AdminCommandCheck";
import StartTyping from "../../hooks/StartTyping";
import OwnerOnly from "../../checks/OwnerOnly";
import FMcord from "../../handler/FMcord";

export default class SaySubcommand extends CommandParams {
    
    public constructor() {
        super(`say`, {
            aliases: [`s`],
            requirements: {
                userIDs: OwnerOnly,
            },
            argsRequired: true,
            guildOnly: true,
            invalidUsageMessage: (message: Message) => `${message.author.mention}, missing channel ID!`,
            hooks: {
                postCheck: AdminCommandCheck,
                preCommand: StartTyping
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const client = message.channel.client as FMcord;
        const dmChannel = await message.author.getDMChannel();
        try {
            await client.createMessage(args[0], args.slice(1).join(` `));
            await dmChannel.createMessage(`:white_check_mark:`);
        } catch (e) {
            console.error(e);
        }
    }

}