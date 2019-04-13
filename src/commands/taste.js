const { RichEmbed } = require(`discord.js`);
const { stringify } = require(`querystring`);
const fetch = require(`node-fetch`);
const toJson = r => r.json();
const difference = (a, b) => {
  if (a > b) return a - b;
  else return b - a;
};
exports.run = async (client, message, args) => {
  try {
    const Users = client.sequelize.import(`../models/Users.js`);
    if (!args[0]) return message.reply(`specify a user you want to compare ` +
    `tastes with!`);
    const author = await Users.findOne({
      where: {
        discordUserID: message.author.id
      }
    });
    if (!author) return message.reply(client.snippets.noLogin);
    const userID = message.mentions.users.first().id;
    if (!userID) return message.channel.send(`Couldn't find the user ` +
    `in Discord. Make sure you mentioned a valid user correctly and try again!`);
    const user = await Users.findOne({ where: { discordUserID: userID } });
    if (!user) return message.channel.send(`This user hasn't logged ` +
    `on to my system.`);
    const authorParams = {
      method: `user.gettopartists`,
      user: author.get(`lastFMUsername`),
      period: `overall`,
      limit: `100`,
      api_key: client.config.lastFM.apikey,
      format: `json`,
    };
    const userParams = Object.assign({}, authorParams);
    userParams.user = user.get(`lastFMUsername`);
    const authorQuery = stringify(authorParams);
    const userQuery = stringify(userParams);
    const authorData = await fetch(client.config.lastFM.endpoint + authorQuery)
      .then(toJson);
    const userData = await fetch(client.config.lastFM.endpoint + userQuery)
      .then(toJson);
    const matches = [];
    for (const a of userData.topartists.artist) {
      const match = authorData.topartists.artist.find(x => x.name === a.name);
      if (match) {
        const playcounts = [parseInt(match.playcount), parseInt(a.playcount)];
        const diff = difference(...playcounts);
        const data = {
          name: match.name,
          authorPlays: match.playcount,
          userPlays: a.playcount,
          difference: diff,
        };
        if (matches.length !== 10) matches.push(data);
        else break;
      }
    }
    if (matches.length === 0) return message.reply(`you and `
    + `${user.get(`lastFMUsername`)} share no common artists.`);
    matches.sort((a, b) => a.difference - b.difference);
    const embed = new RichEmbed()
      .setColor(message.member.displayColor)
      .setTitle(`${author.get(`lastFMUsername`)} and ` +
      `${user.get(`lastFMUsername`)} taste comparison`)
      .setThumbnail(message.author.avatarURL)
      .setTimestamp()
      .setFooter(`Command invoked by ${message.author.tag}`);
    matches.forEach(m => {
      const comp = `${m.authorPlays} plays - ${m.userPlays} plays`;
      embed.addField(`${m.name}`, comp, true);
    });
    await message.channel.send({embed});
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `taste`,
  description: `Compares artists you and a mentioned user listen to, and ` +
  `amounts of plays you both have.`,
  usage: `taste <user mention>`,
  notes: `This only works in a guild and only if both of the users are ` +
  `registered to the bot.`
};
