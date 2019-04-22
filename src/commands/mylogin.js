const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message) => {
  const fetchUser = new fetchuser(client, message);
  try {
    const user = await fetchUser.get();
    if (!user) await message.reply(`you haven't logged into my system. You ` +
    `can do so by doing \`${client.config.prefix}login ` +
    `<your last.fm username>\`.`);
    else {
      const name = user.get(`lastFMUsername`);
      await message.reply(`you have logged in as \`${name}\`.`);
    }
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `mylogin`,
  description: `Shows you a Last.fm username you have registered yourself ` +
  `with, if any.`,
  usage: `mylogin`
};
