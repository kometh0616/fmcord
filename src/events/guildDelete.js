module.exports = async client => {
  const guilds = await client.shard.fetchClientValues(`guilds.size`);
  const guildsSize = guilds.reduce((prev, guild) => prev + guild, 0);
  await client.user.setPresence({
    game: {
      name: `with ${guildsSize} servers | Do ${client.config.prefix}help!`
    },
    status: `online`
  });
};
