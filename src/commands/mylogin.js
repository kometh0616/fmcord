exports.run = async (client, message) => {
  const Users = client.sequelize.import(`../models/Users.js`);
  try {
    const user = await Users.findOne({
      where: {
        discordUserID: message.author.id
      }
    });
    if (!user) await message.reply(`you haven't logged into my system. You ` +
    `can do so by doing \`${client.config.prefix}login ` +
    `<your last.fm username>\`.`);
    else {
      const name = user.get(`lastFMUsername`);
      await message.reply(`you have logged in as \`${name}\`.`);
    }
  } catch (e) {
    console.error(e);
    await message.channel.send(`${client.config.botOwnerID}, something is ` +
    `NOT ok.`);
  }
};
