import CommandParams from "../../handler/CommandParams";
import OwnerOnly from "../../checks/OwnerOnly";
import AdminCommandCheck from "../../hooks/AdminCommandCheck";
import { Message } from "eris";
import { inspect } from "util";
import StartTyping from "../../hooks/StartTyping";

export default class EvalSubcommand extends CommandParams {

    public constructor() {
        super(`eval`, {
            aliases: [`e`],
            argsRequired: true,
            invalidUsageMessage: (message: Message) => `${message.author.mention}, you must provide code you want to evaluate!`,
            requirements: {
                userIDs: OwnerOnly,
            },
            hooks: {
                postCheck: AdminCommandCheck,
                preCommand: StartTyping
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        try {
            const code: string = args.join(` `);
            let evaled: unknown = eval(code);
            if (typeof evaled !== `string`) {
                evaled = inspect(evaled);
            } 
            await message.channel.createMessage(`\`\`\`js\n${evaled}\`\`\``);
        } catch (e) {
            await message.channel.createMessage(`\`\`\`xl\n${e}\`\`\``);
        }
    }

}