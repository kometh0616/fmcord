import FMcord from "../handler/FMcord";
import { Guild } from "discord.js";

module.exports = async (client: FMcord, guild: Guild): Promise<void> => {
    if (guild.members.filter(x => !x.user.bot).size < 15) {
        try {
            await guild.leave();
            const dmChannel = await guild.owner.createDM();
            await dmChannel.send(`Hello, ${guild.owner.user.username}.\n` +
            `Unfortunately, FMcord had to leave your server ${guild.name} because it was too small ` +
            `(15 user accounts are needed). This was done to save some resources for the bot and make it function once again.\n` +
            `We apologise for the caused inconvenience and hope that you proceed to use our bot in bigger communities instead.\n` +
            `- The FMcord team`);
        } catch (e) {
            console.error(e);
        }
    } else {
        const guilds: number[] = await client.shard.fetchClientValues(`guilds.size`);
        const total = guilds.reduce((acc: number, val: number) => acc + val, 0);
        await client.user.setPresence({
            game: {
                name: `with ${total} servers | Do ${client.defaultPrefix}help!`
            }
        });
    }
};