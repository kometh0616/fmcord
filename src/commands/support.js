exports.run = async (client, message) => {
  try {
    await message.channel.send(`Here is a server where you can ask questions, ` +
    `get help and support and provide feedback on FMcord: https://discord.gg/` +
    `BrJ6zEk`);
  } catch (e) {
    console.error(e);
    await message.channel.send(client.replies.error);
  }
};

exports.help = {
  name: `support`,
  description: `Provides you a link to FMcord Support server.`,
  usage: `support`
};
