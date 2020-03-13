import CommandParams from "../handler/CommandParams";
import PostCheck from "../hooks/PostCheck";
import StartTyping from "../hooks/StartTyping";
import UsernameAndNotDisabled from "../checks/UsernameAndNotDisabled";
import { Message } from "eris";
import UserFetcher from "../classes/UserFetcher";
import DiscordUserGetter from "../utils/DiscordUserGetter";
import snippets from "../snippets";
import Library from "../lib/lastfm";
import FMcord from "../handler/FMcord";

export default class ScrobblesCommand extends CommandParams {

    public constructor() {
        super(`scrobbles`, {
            description: `Tells you a user's total scrobble amount.`,
            usage: [`scrobbles`, `scrobbles <user>`].join(`, `),
            aliases: [`s`],
            hooks: {
                postCheck: PostCheck,
                preCommand: StartTyping
            },
            requirements: {
                custom: UsernameAndNotDisabled
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const client = message.channel.client as FMcord;
        const userFetcher = new UserFetcher(message);
        let username: string | null;
        if (args.length > 0) {
            const user = DiscordUserGetter(message, args.join(` `));
            if (user !== null) {
                username = await userFetcher.usernameFromID(user.id);
                if (username === null) {
                    await message.channel.createMessage(`${message.author.mention}, ${snippets.userNoLogin}`);
                    return;
                }
            } else {
                await message.channel.createMessage(`${message.author.mention}, ${snippets.userNotFound}`);
                return;
            }
        } else {
            username = (await userFetcher.username())!;
        }
        const lib = new Library(client.apikeys.lastFM);
        const user = await lib.user.getInfo(username);
        await message.channel.createMessage(`${message.author.mention}, **${user.name}'s** scrobble amount is \`${user.playcount}\`.`);
    }

}