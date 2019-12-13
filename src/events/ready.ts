import FMcord from "../handler/FMcord";

module.exports = async (client: FMcord): Promise<void> => {
    const guilds: number[] = await client.shard.fetchClientValues(`guilds.size`);
    const total = guilds.reduce((acc: number, val: number) => acc + val, 0);
    await client.user.setPresence({
        game: {
            name: `with ${total} servers | Do ${client.defaultPrefix}help!`
        }
    });
    const script = `
    const apology = (owner, guild) => \`Hello, \${owner}.\\n\` +
    \`Unfortunately, FMcord had to leave your server \${guild} because it was too small (15 user accounts are needed). This was done to save some resources for the bot and make it function once again.\\n\` +
    \`We apologise for the caused inconvenience and hope that you proceed to use our bot in bigger communities instead.\\n\` +
    \`- The FMcord team\`
    this.guilds.filter(x => x.members.filter(m => !m.user.bot).size < 15)
        .forEach(guild => guild.leave()
        .then(g => g.owner.user.createDM()
            .then(channel => channel.send(apology(g.owner.user.username, g.name)))
            .catch(console.error)))`;
    await client.shard.broadcastEval(script);
};