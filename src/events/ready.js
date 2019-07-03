module.exports = client => {
  client.user.setPresence({
    game: {
      name: `with ${client.guilds.size} servers | Do ${client.config.prefix}help!`
    },
    status: `online`
  });
  setInterval(() => client.user.setPresence({
    game: {
      name: `with ${client.guilds.size} servers | Do ${client.config.prefix}help!`
    },
    status: `online`
  }), 20000);
};
