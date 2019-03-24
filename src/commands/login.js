const querystring = require(`querystring`);
const fetch = require(`node-fetch`);

exports.run = async (client, message, args) => {
  const Users = client.sequelize.import(`../models/Users.js`);
  const username = args.join(` `);
  if (!args[0]) return message.reply(`you must define a Last.fm username!`);

  const query = querystring.stringify({
    method: `user.getinfo`,
    user: username,
    api_key: client.config.lastFM.apikey,
    format: `json`,
  });

  try {
    const data = await fetch(client.config.lastFM.endpoint + query)
      .then(r => r.json());
    if (data.error === 6) return message.reply(`no Last.fm user found with ` +
    `given nickname!`);
    const alreadyExists = await Users.findOne({
      where: {
        discordUserID: message.author.id
      }
    });
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
    await message.channel.send(client.replies.error);
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
