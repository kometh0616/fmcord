import CommandParams from "../handler/CommandParams";
import { Message } from "eris";
import StartTyping from "../hooks/StartTyping";
import PostCheck from "../hooks/PostCheck";
import NotDisabled from "../checks/NotDisabled";
import { Users } from "../entities/Users";
import { FindConditions } from "typeorm";

export default class ExportCommand extends CommandParams {

    public constructor() {
        super(`export`, {
            description: `Exports a list of users in your server.`,
            fullDescription: `The list is exported in JSON format as ` +
            `an array of objects with discordUserID and lastFMUsername ` +
            `as their properties.\n` +
            `This command requires Manage Server permission. Can be overriden ` +
            `if you have Administrator permissions, or if you are an owner of the guild.`,
            hooks: {
                preCommand: StartTyping,
                postCheck: PostCheck
            },
            requirements: {
                custom: NotDisabled,
                permissions: {
                    manageGuild: true,
                }
            },
            guildOnly: true,
            permissionMessage: (message: Message) => `${message.author.mention}, you do not have a permission \`Manage Guild\` to use this command.`,
        });
    }

    public async execute(message: Message): Promise<void> {
        const loggedInUsers = message.member!.guild.members.map(member => Users.findOne({
            discordUserID: member.id
        }));
        const users: FindConditions<Users>[] = [];
        for await (const user of loggedInUsers) {
            if (user !== undefined) {
                users.push({
                    discordUserID: user.discordUserID,
                    lastFMUsername: user.lastFMUsername
                });
            } 
        }
        const dmChannel = await message.author.getDMChannel();
        await message.channel.createMessage(`${message.author.mention}, check your DMs!`);
        await dmChannel.createMessage(``, {
            file: JSON.stringify(users, null, 4),
            name: `users_${message.member!.guild.name}_UTC-${new Date().toISOString()}.json`
        });
    }

}