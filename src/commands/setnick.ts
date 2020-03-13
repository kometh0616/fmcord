import CommandParams from "../handler/CommandParams";
import { Message } from "eris";
import Library from "../lib/lastfm";
import { Users } from "../entities/Users";
import UserFetcher from "../classes/UserFetcher";
import StartTyping from "../hooks/StartTyping";
import FMcord from "../handler/FMcord";
import NotDisabled from "../checks/NotDisabled";
import { Disables } from "../entities/Disables";

export default class SetnickCommand extends CommandParams {

    public constructor() {
        super(`setnick`, {
            aliases: [`login`],
            description: `Sets your nickname in the bot's database.`,
            usage: `setnick <nickname>`,
            argsRequired: true,
            invalidUsageMessage: (message: Message) => `${message.author.mention}, you must provide a Last.fm username!`,
            hooks: {
                async postCheck(message: Message, args: string[], checkPassed: boolean): Promise<void> {
                    if (!checkPassed) {
                        const userFetcher = new UserFetcher(message);
                        const username = await userFetcher.username();
                        if (username !== null) {
                            message.channel.createMessage(`${message.author.mention}, you already have a nickname set.`);
                        } else {
                            const isDisabled = await Disables.findOne({
                                where: [
                                    { discordID: message.channel.id, cmdName: message.command?.label },
                                    { discordID: message.guildID, cmdName: message.command?.label }
                                ]
                            });
                            if (isDisabled !== undefined) {
                                const guildDisabled = isDisabled.discordID === message.guildID;
                                await message.channel.createMessage(`${message.author.mention}, command \`${message.command?.label}\` is disabled in ${guildDisabled ? message.member!.guild.name : `this channel`}`);
                            }
                        }
                        return;
                    }
                },
                preCommand: StartTyping
            },
            requirements: {
                custom: async (message: Message): Promise<boolean> => {
                    const userFetcher = new UserFetcher(message);
                    const username = await userFetcher.username();
                    return username === null && await NotDisabled(message);
                }
            },
        });
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const username = args.join(` `);
        const lib = new Library((message.channel.client as FMcord).apikeys.lastFM);
        try {
            const user = await lib.user.getInfo(username);
            const newUser = new Users();
            newUser.discordUserID = message.author.id;
            newUser.lastFMUsername = user.name;
            await newUser.save();
            await message.channel.createMessage(`${message.author.mention}, your nickname \`${user.name}\` was created succesfully!`);
        } catch (e) {
            if (e.message.endsWith(`404`)) {
                await message.channel.createMessage(`${message.author.mention}, no user with the name \`${args.join(` `)}\` found in Last.fm`);
            }
        }
    }
}