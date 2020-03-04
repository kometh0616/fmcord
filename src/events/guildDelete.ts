import FMcord from "../handler/FMcord";

module.exports = async (client: FMcord): Promise<void> => {
    if (client.shard !== null) {
        const guilds: number[] = await client.shard.fetchClientValues(`guilds.cache.size`);
        const total = guilds.reduce((acc: number, val: number) => acc + val, 0);
        await client.user?.setPresence({
            activity: {
                name: `with ${total} servers | Do ${client.defaultPrefix}help!`
            }
        });
    } else {
        await client.user?.setPresence({
            activity: {
                name: `with ${client.guilds.cache.size} servers | Do ${client.defaultPrefix}help!`
            }
        });
    }
};