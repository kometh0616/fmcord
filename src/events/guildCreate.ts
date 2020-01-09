import FMcord from "../handler/FMcord";

module.exports = async (client: FMcord): Promise<void> => {
    const guilds: number[] = await client.shard.fetchClientValues(`guilds.size`);
    const total = guilds.reduce((acc: number, val: number) => acc + val, 0);
    await client.user.setPresence({
        game: {
            name: `with ${total} servers | Do ${client.defaultPrefix}help!`
        }
    });
};