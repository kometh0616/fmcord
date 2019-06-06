const Library = require(`../lib/index.js`);
const { RichEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message) => {
  const lib = new Library(client.config.lastFM.apikey);
  const fetchUser = new fetchuser(client, message);
  try {
    const user = await fetchUser.username();
    if (!user) return message.reply(client.snippets.noLogin);
    const data = await lib.user.getRecentTracks(user);
    const userData = await lib.user.getInfo(user);
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
      .setTitle(`Last tracks from ${user}`)
      .setURL(userData.user.url)
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
