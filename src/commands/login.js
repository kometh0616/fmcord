const Library = require(`../lib/index.js`);
const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const lib = new Library(client.config.lastFM.apikey);
  const fetchUser = new fetchuser(client, message);
  const Users = client.sequelize.import(`../models/Users.js`);
  const username = args.join(` `);
  if (!args[0]) return message.reply(`you must define a Last.fm username!`);

  try {
    const data = await lib.user.getInfo(username);
    const alreadyExists = await fetchUser.get();
    if (alreadyExists) return message.reply(`you already have logged in via ` +
    `this bot! Please do \`${client.config.prefix}logout\` if you want to ` +
    `use a different account.`);

    await Users.create({
      discordUserID: message.author.id,
      lastFMUsername: data.user.name
    });
    await message.reply(`your Last.fm username \`${data.user.name}\` ` +
    `has been registered to this bot! Note that you won't be able to ` +
    `perform any administrative actions to it.`);
  } catch (e) {
    console.log(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `login`,
  description: `Logs you into the bot system.`,
  usage: `login <last.fm username>`,
  notes: `You will only be registered to the bot. You won't be able to ` +
  `perform any administrative actions to your Last.fm account, and no ` +
  `one else will be able to do so through the bot.`
};
