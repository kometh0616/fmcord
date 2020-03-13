import CommandParams from "../handler/CommandParams";
import StartTyping from "../hooks/StartTyping";
import { Message } from "eris";
import snippets from "../snippets";
import NotDisabled from "../checks/NotDisabled";
import PostCheck from "../hooks/PostCheck";

export default class InviteCommand extends CommandParams {

    public constructor() {
        super(`invite`, {
            description: `Sends you a bot invitation link, by which you can invite this bot to your server.`,
            usage: `invite`,
            aliases: [`inv`, `botinvite`],
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
        await message.channel.createMessage(`${message.author.mention}, you can invite me to your server using this link: ${snippets.dBotsLink}`);
    } 

}