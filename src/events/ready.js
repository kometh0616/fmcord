module.exports = client => client.user.setPresence({
  game: { name: `Do ${client.config.prefix}help --manual!` },
  status: `online`
});
