exports.run = async (client, message, args) => {
  try {
    if (args.length === 0) return message.reply(`please specify a channel ID!`);
    else if (!args[1]) return message.reply(`no message content provided!`);
    const channelID = args[0];
    const content = args.slice(1).join(` `);
    const sent = await client.shard.broadcastEval(`
      (async () => {
        const channel = this.channels.get('${channelID}');
        if (channel) {
          await channel.send('${content}');
          return true;
        } else {
          return false;
        }
      })()
    `);
    if (sent) {
      await message.channel.send(`:white_check_mark:`);
    } else {
      await message.channel.send(`:x:`);
    }
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};
