import CommandParams from "../handler/CommandParams";
import StartTyping from "../hooks/StartTyping";
import { Message, Member } from "eris";
import UserFetcher from "../classes/UserFetcher";
import DiscordUserGetter from "../utils/DiscordUserGetter";
import NotDisabled from "../checks/NotDisabled";
import PostCheck from "../hooks/PostCheck";

export default class LastFMCommand extends CommandParams {

    public constructor() {
        super(`lastfm`, {
            description: `Gets the LastFM URL of you or a given user.`,
            usage: [`lastfm`, `lastfm <discord user>`].join(`, `),
            aliases: [`lfm`],
            fullDescription: `The looked up user must have a Last.fm nickname set to the bot.`,
            guildOnly: true,
            requirements: {
                custom: NotDisabled
            },
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            }
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const userFetcher = new UserFetcher(message);
        let discordUser: Member | null;
        if (args.length > 0) {
            discordUser = DiscordUserGetter(message, args.join(` `));
            if (discordUser === null) {
                await message.channel.createMessage(`\`${args.join(` `)}\` is not a valid user.`);
            }
        } else {
            discordUser = message.member!;
        }
        const user = await userFetcher.usernameFromID(discordUser!.id);
        if (user !== null) {
            const URL = `https://last.fm/user/${user}`;
            await message.channel.createMessage(`${message.author.mention}, ${discordUser!.username}'s Last.fm URL: ${URL}`);
        } else {
            await message.channel.createMessage(`${message.author.mention}, \`${discordUser!.username}\` does not have a Last.fm account, or has not set their nickname.`);
        }
    }

}