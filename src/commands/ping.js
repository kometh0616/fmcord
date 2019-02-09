exports.run = async (client, message) => {
  const { botOwnerID } = client.config;
  try {
    const oldDate = Date.now();
    const msg = await message.channel.send(`Pong!`);
    const ping = Date.now() - oldDate;
    await msg.edit(`Pong! The ping is ${ping}ms.`);
  } catch (e) {
    console.error(e.stack);
    await message.channel.send(`<@${botOwnerID}>, something is NOT ok!`);
  }
};
