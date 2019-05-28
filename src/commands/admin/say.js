exports.run = async (client, message, args) => {
  try {
    console.log(args);
    if (args.length === 0) return message.reply(`please specify a channel ID!`);
    else if (!args[1]) return message.reply(`no message content provided!`);
    const channelID = args[0];
    const content = args.slice(1).join(` `);
    const channel = client.channels.get(channelID);
    if (!channel) return message.reply(`no channel with ID \`${channelID}\` ` +
    `found.`);
    await channel.send(content);
    await message.channel.send(`:white_check_mark:`);
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};
