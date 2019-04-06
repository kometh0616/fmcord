module.exports = async (client, message) => {
  if (message.author.bot || !message.content.startsWith(client.config.prefix))
    return;
  else {
    const args = message.content.slice(client.config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const matchChannel = x => x.channelID === message.channel.id;
    const command = client.commands.get(commandName);
    if (!command) return;
    else {
      const Disables = client.sequelize.import(`../models/Disables.js`);
      const dCommands = await Disables.findAll({
        where: {
          guildID: message.guild.id,
          cmdName: commandName,
        }
      });
      if (dCommands === [])
        command.run(client, message, args);
      else if (dCommands.some(matchChannel))
        return message.reply(`this command was disabled in this channel.`);
      else if (dCommands.some(x => x.guildDisabled))
        return message.reply(`this command was disabled in this server.`);
      else
        command.run(client, message, args);
    }
  }
};
