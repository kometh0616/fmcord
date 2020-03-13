import CommandParams from "../handler/CommandParams";
import StartTyping from "../hooks/StartTyping";
import { Message } from "eris";
import FMcord from "../handler/FMcord";
import { Users } from "../entities/Users";
import FMcordEmbed from "../classes/FMcordEmbed";
import snippets from "../snippets";
import AgePrint from "../utils/AgePrint";

export default class BotInfoCommand extends CommandParams {

    public constructor() {
        super(`botinfo`, {
            description: `Shows general information about FMcord.`,
            usage: `botinfo`,
            aliases: [`bi`],
            hooks: {
                preCommand: StartTyping,
            },
        });
    }

    public async execute(message: Message): Promise<void> {
        const client = message.channel.client as FMcord;
        const users = client.users.size;
        const guilds = client.guilds.size;
        const dev = client.users.get(client.ownerID);
        const shared = client.guilds.filter(g => g.members.has(message.author.id)).length;
        const nicknames = await Users.count();
        const creationDate = new Date(client.user.createdAt);
        const embed = new FMcordEmbed(message)
            .setTitle(`Information about FMcord`)
            .setURL(snippets.github)
            .addField(`Created at`, `${creationDate.toUTCString()} (${AgePrint(creationDate)})`, true)
            .addField(`Total servers`, String(guilds), true)
            .addField(`Total users`, String(users), true)
            .addField(`Total logged in users`, String(nicknames), true)
            .addField(`Used library`, `eris`, true)
            .addField(`Developed by`, `${dev!.username}#${dev!.discriminator}`, true)
            .addField(`Amount of servers shared with command invoker`, String(shared), true);
        await message.channel.createMessage({ embed });
    }

}