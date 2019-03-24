exports.run = async (client, message) => {
  const Users = client.sequelize.import(`../models/Users.js`);
  try {
    const user = await Users.findOne({
      where: {
        discordUserID: message.author.id
      }
    });
    if (!user) return message.reply(`your instance hasn't been found.`);
    await Users.destroy({
      where: {
        discordUserID: message.author.id,
      }
    });
    await message.reply(`you've been logged off from your Last.fm account `
    + `succesfully!`);
  } catch (e) {
    console.error(e);
    await message.channel.send(client.replies.error);
  }
};

exports.help = {
  name: `logout`,
  description: `Logs you out of the bot's system.`,
  usage: `logout`
};
