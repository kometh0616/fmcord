module.exports = async client => {
  await client.user.setPresence({
    game: {
      name: `with ${client.guilds.size} servers | Do ${client.config.prefix}help!`
    },
    status: `online`
  });
};
