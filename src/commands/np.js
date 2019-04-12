const { stringify } = require(`querystring`);
const fetch = require(`node-fetch`);
const { RichEmbed } = require(`discord.js`);

exports.run = async (client, message) => {
  try {
    const { apikey, endpoint } = client.config.lastFM;
    const Users = client.sequelize.import(`../models/Users.js`);
    const user = await Users.findOne({
      where: {
        discordUserID: message.author.id
      }
    });
    if (!user) return message.reply(client.snippets.noLogin);
    const lUsername = user.get(`lastFMUsername`);
    const params = {
      method: `user.getrecenttracks`,
      user: lUsername,
      api_key: apikey,
      format: `json`
    };
    const query = stringify(params);
    const data = await fetch(endpoint + query).then(r => r.json());
    const track = data.recenttracks.track[0];
    const prevTrack = data.recenttracks.track[1];
    if (!track[`@attr`])
      return message.reply(client.snippets.notPlaying);
    const userParams = Object.assign({}, params);
    userParams.method = `user.getinfo`;
    const userQuery = stringify(userParams);
    const userData = await fetch(endpoint + userQuery).then(r => r.json());
    const embed = new RichEmbed()
      .addField(`Current:`, `**${track.name}** - ${track.artist[`#text`]} ` +
        `| ${track.album[`#text`] ? track.album[`#text`] : `no album`}`)
      .addField(`Previous:`,
        `**${prevTrack.name}** - ${prevTrack.artist[`#text`]} | ` +
        `${prevTrack.album[`#text`] ? prevTrack.album[`#text`] : `no album`}`)
      .setColor(message.member.displayColor)
      .setTitle(`Last tracks from ${lUsername}`)
      .setURL(userData.user.url)
      .setThumbnail(track.image[2][`#text`])
      .setFooter(`Command invoked by ${message.author.tag} with a total ` +
        `of ${userData.user.playcount} scrobbles.`)
      .setTimestamp();
    await message.channel.send({ embed });
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `np`,
  description: `Shows you a song you are listening to right now.`,
  usage: `np`
};
