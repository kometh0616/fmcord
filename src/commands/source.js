exports.run = async (client, message, args) => {
  try {
    if (!args[0]) {
      await message.channel.send(`Here is a FMcord GitHub repository: ` +
      client.snippets.github);
    } else {
      const cmd = args[0].toLowerCase();
      if (!client.commands.has(cmd)) return message.reply(`I can't find ` +
      `a command called ${cmd}.`);
      await message.channel.send(`Here is source to a command ${cmd}: ` +
      client.snippets.getSource(cmd));
    }
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `source`,
  description: `Sends you a link to FMcord's GitHub repository. If a command ` +
  `name is provided, links you to the source of the provided command.`,
  usage: `source [<command name>]`
};
