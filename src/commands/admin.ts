import CommandParams from "../handler/CommandParams";
import { Message } from "eris";
import StartTyping from "../hooks/StartTyping";
import AdminCommandCheck from "../hooks/AdminCommandCheck";
import OwnerOnly from "../checks/OwnerOnly";

export default class AdminCommand extends CommandParams {

    public constructor() {
        super(`admin`, {
            aliases: [`a`],
            hidden: true,
            requirements: {
                userIDs: OwnerOnly
            },
            hooks: {
                postCheck: AdminCommandCheck,
                preCommand: StartTyping
            },
            argsRequired: true,
            invalidUsageMessage: (message: Message) => `${message.author.mention}, you need to provide an appropriate subcommand!`,
        });
    }

    public async execute(message: Message): Promise<void> {
        await message.channel.createMessage(`Check passed, you are the developer!`);
    }
}