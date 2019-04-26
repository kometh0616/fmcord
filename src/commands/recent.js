const { stringify } = require(`querystring`);
const fetch = require(`node-fetch`);
const { RichEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message) => {
  const fetchUser = new fetchuser(client, message);
  try {
    const { apikey, endpoint } = client.config.lastFM;
    const user = await fetchUser.get();
    if (!user) return message.reply(client.snippets.noLogin);
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
    const nowPlaying = data.recenttracks.track[0];
    const sliceArgs = nowPlaying[`@attr`] && nowPlaying[`@attr`].nowplaying ?
      [1, 6] : [0, 5];
    const prevTracks = data.recenttracks.track
      .slice(...sliceArgs)
      .map(x => `**${x.name}** - ${x.artist[`#text`]} ` +
        `| ${x.album[`#text`] ? x.album[`#text`] : `no album`}`)
      .join(`\n`);
    const embed = new RichEmbed();
    if (nowPlaying[`@attr`] && nowPlaying[`@attr`].nowplaying)
      embed.addField(`Current:`,
        `**${nowPlaying.name}** - ${nowPlaying.artist[`#text`]} ` +
        `| ${nowPlaying.album[`#text`] ? nowPlaying.album[`#text`] : `no album`}`);
    embed
      .addField(`Previous:`, prevTracks)
      .setColor(message.member.displayColor)
      .setTitle(`Last tracks from ${lUsername}`)
      .setURL(profileLink)
      .setThumbnail(data.recenttracks.track[0].image[2][`#text`])
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
  name: `recent`,
  description: `Shows you recent tracks you have listened to.`,
  usage: `recent`,
  notes: `If you are listening to a song when invoking this command, it will ` +
  `show your currently listened song as well.`
};
