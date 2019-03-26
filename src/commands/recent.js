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
    if (!user) return message.reply(`you haven't registered your Last.fm ` +
    `user account to this bot! Please do so with \`${client.config.prefix}` +
    `login <lastfm username>\` to be able to use this command!`);
    const lUsername = user.get(`lastFMUsername`);
    const profileLink = `https://last.fm/user/${lUsername}`;
    const params = {
      method: `user.getrecenttracks`,
      user: lUsername,
      api_key: apikey,
      format: `json`
    };
    const query = stringify(params);
    const data = await fetch(endpoint + query).then(r => r.json());
    const userParams = Object.assign({}, params);
    userParams.method = `user.getinfo`;
    const userQuery = stringify(userParams);
    const userData = await fetch(endpoint + userQuery).then(r => r.json());
    const nowPlaying = data.recenttracks.track.find(x => x[`@attr`].nowplaying);
    const prevTracks = data.recenttracks.track
      .slice(0, 5)
      .map(x => `**${x.name}** - ${x.artist[`#text`]} ` +
        `| ${x.album[`#text`] ? x.album[`#text`] : `no album`}`)
      .join(`\n`);
    const embed = new RichEmbed();
    if (nowPlaying)
      embed.addField(`Current:`,
        `**${nowPlaying.name}** - ${nowPlaying.artist[`#text`]} ` +
        `| ${nowPlaying.album[`#text`] ? nowPlaying.album[`#text`] : `no album`}`);
    embed.addField(`Previous:`, prevTracks);
    embed.setColor(message.member.displayColor);
    embed.setTitle(`Last tracks from ${lUsername}`);
    embed.setURL(profileLink);
    embed.setThumbnail(data.recenttracks.track[0].image[2][`#text`]);
    embed.setFooter(`Command invoked by ${message.author.tag} with a total ` +
      `of ${userData.user.playcount} scrobbles.`);
    embed.setTimestamp();
    await message.channel.send({ embed });
  } catch (e) {
    console.error(e);
    await message.channel.send(client.replies.error);
  }
};

exports.help = {
  name: `recent`,
  description: `Shows you recent tracks you have listened to.`,
  usage: `recent`,
  notes: `If you are listening to a song when invoking this command, it will ` +
  `show your currently listened song as well.`
};
