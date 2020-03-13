import CommandParams from "../handler/CommandParams";
import { Message } from "eris";
import { Users } from "../entities/Users";
import PostCheck from "../hooks/PostCheck";
import UserFetcher from "../classes/UserFetcher";
import { Modes } from "../entities/Modes";
import StartTyping from "../hooks/StartTyping";
import UsernameAndNotDisabled from "../checks/UsernameAndNotDisabled";

export default class DelnickCommand extends CommandParams {

    public constructor() {
        super(`delnick`, {
            aliases: [`logout`],
            description: `Removes your nickname from the bot's database.`,
            usage: `delnick`,
            requirements: {
                custom: UsernameAndNotDisabled
            },
            hooks: {
                postCheck: PostCheck,
                preCommand: StartTyping
            }
        });
    }

    public async execute(message: Message): Promise<void> {
        const userFetcher = new UserFetcher(message);
        const user = await userFetcher.getAuthor();
        await Modes.delete({ user });
        await Users.delete({ discordUserID: user?.discordUserID });
        await message.channel.createMessage(`${message.author.mention}, your nickname was deleted succesfully!`);
    }

}