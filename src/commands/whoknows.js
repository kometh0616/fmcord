const fetch = require(`node-fetch`);
const { stringify } = require(`querystring`);
const { RichEmbed } = require(`discord.js`);
const sortingFunc = (a, b) => parseInt(b.plays) - parseInt(a.plays);


exports.run = async (client, message, args) => {
  try {
    const Users = client.sequelize.import(`../models/Users.js`);
    const artistName = args.join(` `);
    if (!artistName) return message.reply(`you haven't defined an artist!`);
    const know = [];
    const params = {
      method: `artist.getinfo`,
      artist: artistName,
      api_key: client.config.lastFM.apikey,
      format: `json`
    };
    const query = stringify(params);
    const { artist } = await fetch(client.config.lastFM.endpoint + query)
      .then(r => r.json());

    if (!artist) return message.reply(`there is no such artist as ` +
    `\`${artistName}\` in Last.fm.`);

    for (const [id, member] of message.guild.members) {
      const dbParams = { where: { discordUserID: id } };
      const user = await Users.findOne(dbParams);
      if (!user) continue;
      const queryParams = Object.assign({}, params);
      queryParams.username = user.get(`lastFMUsername`);
      const query = stringify(queryParams);
      const { artist } = await fetch(client.config.lastFM.endpoint + query)
        .then(r => r.json());

      if (!artist.stats.userplaycount) continue;

      const data = {
        name: member.user.username,
        plays: artist.stats.userplaycount
      };
      if (know.length !== 10) know.push(data);
      else break;
    }
    if (know.length === 0) return message.reply(`no one here listens to ` +
    `${artist.name}.`);
    know.sort(sortingFunc);
    let description = ``;
    let x = 0;
    know.forEach(k => {
      description += `${++x}. ${k.name} - **${k.plays}** plays\n`;
    });
    const embed = new RichEmbed()
      .setColor(message.member.displayColor)
      .setTitle(`Who knows ${artist.name}?`)
      .setThumbnail(artist.image[2][`#text`])
      .setDescription(description)
      .setFooter(`Command invoked by ${message.author.tag}`)
      .setTimestamp();
    await message.channel.send({embed});
  } catch (e) {
    const { botOwnerID } = client.config;
    console.error(e);
    await message.channel.send(`<@${botOwnerID}>, something is NOT ok.`);
  }
};
