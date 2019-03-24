const { stringify } = require(`querystring`);
const fetch = require(`node-fetch`);

exports.run = async (client, message, args) => {
  const artistName = args.join(` `);
  if (!artistName) return message.reply(`you have not defined an artist!`);
  const Users = client.sequelize.import(`../models/Users.js`);
  try {
    const user = await Users.findOne({
      where: {
        discordUserID: message.author.id
      }
    });
    if (!user) return message.reply(client.replies.noLogin);
    const query = stringify({
      method: `artist.getinfo`,
      username: user.get(`lastFMUsername`),
      artist: artistName,
      api_key: client.config.lastFM.apikey,
      format: `json`
    });
    const data = await fetch(client.config.lastFM.endpoint + query)
      .then(r => r.json());

    const { name, stats } = data.artist;
    if (!stats.userplaycount) await message.reply(`you haven't ` +
    `scrobbled \`${name}\`.`);
    else await message.reply(`you have scrobbled \`${name}\` ` +
    `**${stats.userplaycount}** times.`);

  } catch (e) {
    console.log(e);
    await message.channel.send(client.replies.error);
  }
};

exports.help = {
  name: `plays`,
  description: `Shows you how many times you have played an artist.`,
  usage: `plays <artist name>`
};
