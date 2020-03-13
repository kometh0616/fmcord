import CommandParams from "../handler/CommandParams";
import { Message } from "eris";
import StartTyping from "../hooks/StartTyping";
import NotDisabled from "../checks/NotDisabled";
import PostCheck from "../hooks/PostCheck";

export default class PingCommand extends CommandParams {
   
    public constructor() {
        super(`ping`, {
            usage: `ping`,
            description: `Use this to check if the bot is online.`,
            requirements: {
                custom: NotDisabled,
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            }
        });
    }

    public async execute(message: Message): Promise<void> {
        await message.channel.createMessage(`Pong!`);
    }
    
}