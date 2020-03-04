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
        if (client.user !== null) {
            const users = client.shard ? await client.shard.fetchClientValues(`users.cache.size`) : client.users.cache.size;
            const userCount: number = Array.isArray(users) ? users.reduce((acc, val) => acc + val, 0) : users;
            const guilds = client.shard ? await client.shard.fetchClientValues(`guilds.cache.size`) : client.guilds.cache.size;
            const guildCount: number = Array.isArray(guilds) ? guilds.reduce((acc, val) => acc + val, 0) : guilds;
            const dev: User = await client.users.fetch(client.ownerID);
            const shared = client.shard ? await client.shard.broadcastEval(`
            this.guilds.cache.filter(x => x.members.cache.has('${message.author.id}')).size
        `) : client.guilds.cache.filter(x => x.members.cache.has(message.author.id)).size;
            const sharedSize: number = Array.isArray(shared) ? shared.reduce((acc, val) => acc + val, 0) : shared;
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
                .addField(`Amount of servers shared with command invoker`, sharedSize, true);
            const thumbnail = client.user.avatarURL();
            if (thumbnail !== null) {
                embed.setThumbnail(thumbnail);
            }
            await message.channel.send(embed);
        } else {
            await message.reply();
        }
    }

}

module.exports = BotInfoCommand;