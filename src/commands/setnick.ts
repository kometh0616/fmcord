import CommandParams from "../handler/CommandParams";
import { Message } from "eris";
import Library from "../lib/lastfm";
import { Users } from "../entities/Users";
import StartTyping from "../hooks/StartTyping";
import FMcord from "../handler/FMcord";
import NotDisabled from "../checks/NotDisabled";
import PostCheck from "../hooks/PostCheck";
import UserFetcher from "../classes/UserFetcher";

export default class SetnickCommand extends CommandParams {

    public constructor() {
        super(`setnick`, {
            aliases: [`login`],
            description: `Sets your nickname in the bot's database.`,
            fullDescription: `This command can also be used to update your current nickname.`,
            usage: `setnick <nickname>`,
            argsRequired: true,
            invalidUsageMessage: (message: Message) => `${message.author.mention}, you must provide a Last.fm username!`,
            hooks: { 
                postCheck: PostCheck,
                preCommand: StartTyping
            },
            requirements: {
                custom: NotDisabled
            },
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const client = message.channel.client as FMcord;
        const username = args.join(` `);
        const userFetcher = new UserFetcher(message);
        const lib = new Library(client.apikeys.lastFM);
        try {
            const currentUser = await userFetcher.getAuthor();
            const user = await lib.user.getInfo(username);
            if (currentUser !== undefined) {
                currentUser.lastFMUsername = user.name;
                await currentUser.save();
            } else {
                const newUser = new Users();
                newUser.discordUserID = message.author.id;
                newUser.lastFMUsername = user.name;
                await newUser.save();
            }
            await message.channel.createMessage(`${message.author.mention}, your nickname \`${user.name}\` was ${currentUser !== undefined ? `updat` : `creat`}ed successfully!`);
        } catch (e) {
            if (e.message.endsWith(`404`)) {
                await message.channel.createMessage(`${message.author.mention}, no user with the name \`${args.join(` `)}\` found in Last.fm.`);
            }
        }
    }
}