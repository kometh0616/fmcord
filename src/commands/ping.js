exports.run = async (client, message) => {
  const { botOwnerID } = client.config;
  try {
    await message.channel.send(`Pong!`);
  } catch (e) {
    console.error(e.stack);
    await message.channel.send(`<@${botOwnerID}>, something is NOT ok!`);
  }
};
