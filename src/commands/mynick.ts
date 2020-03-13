import CommandParams from "../handler/CommandParams";
import { Message } from "eris";
import UserFetcher from "../classes/UserFetcher";
import StartTyping from "../hooks/StartTyping";
import UsernameAndNotDisabled from "../checks/UsernameAndNotDisabled";
import PostCheck from "../hooks/PostCheck";

export default class MyNickCommand extends CommandParams {

    public constructor() {
        super(`mynick`, {
            aliases: [`mylogin`],
            description: `Shows you your nickname, if any is set.`,
            usage: `mynick`,
            requirements: {
                custom: UsernameAndNotDisabled
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            }
        });
    }

    public async execute(message: Message): Promise<void> {
        const userFetcher = new UserFetcher(message);
        const user = await userFetcher.username();
        await message.channel.createMessage(`${message.author.mention}, your username is \`${user}\`.`);
    }

}