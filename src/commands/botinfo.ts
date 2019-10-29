import Command from "../handler/Command";
import FMcord from "../handler/FMcord";
import { Message, User } from "discord.js";
import { Users } from "../entities/Users";
import FMcordEmbed from "../classes/FMcordEmbed";
import snippets from "../snippets";
import AgePrint from "../utils/AgePrint";

class BotInfoCommand extends Command {

    public constructor() {
        super({
            name: `botinfo`,
            description: `Shows general information about FMcord.`,
            usage: [`botinfo`],
            aliases: [`bi`],
            dmAvailable: true
        });
    }

    public async run(client: FMcord, message: Message): Promise<void> {
        const users: number[] = await client.shard.fetchClientValues(`users.size`);
        const userCount: number = users.reduce((acc, val) => acc + val, 0);
        const guilds: number[] = await client.shard.fetchClientValues(`guilds.size`);
        const guildCount: number = guilds.reduce((acc, val) => acc + val, 0);
        const dev: User = await client.fetchUser(client.ownerID);
        const shared: number[] = await client.shard.broadcastEval(`
            this.guilds.filter(x => x.members.has('${message.author.id}')).size
        `);
        const sharedSize: number = shared.reduce((acc, val) => acc + val, 0);
        const nicknames: number = await Users.count();
        const embed = new FMcordEmbed(message)
            .setTitle(`Information about FMcord`)
            .setURL(snippets.github)
            .addField(`Created at`, `${client.user.createdAt.toUTCString()} (${AgePrint(client.user.createdAt)})`, true)
            .addField(`Total servers`, guildCount, true)
            .addField(`Total users`, userCount, true)
            .addField(`Total logged in users`, nicknames, true)
            .addField(`Used library`, `discord.js`, true)
            .addField(`Developed by`, `${dev.tag}`, true)
            .addField(`Amount of servers shared with command invoker`, sharedSize, true)
            .setThumbnail(client.user.avatarURL);
        await message.channel.send(embed);
    }

}

module.exports = BotInfoCommand;