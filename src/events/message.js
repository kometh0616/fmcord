module.exports = (client, message) => {
  if (message.author.bot || !message.content.startsWith(client.config.prefix))
    return;
  else {
    const args = message.content.slice(client.config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (!command) return;
    else command.run(client, message, args);
  }
};
