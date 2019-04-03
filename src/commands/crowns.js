const { RichEmbed } = require(`discord.js`);
exports.run = async (client, message) => {
  try {
    const Crowns = client.sequelize.import(`../models/Crowns.js`);
    const Users = client.sequelize.import(`../models/Users.js`);
    const user = await Users.findOne({
      where: {
        discordUserID: message.author.id
      }
    });
    if (!user) return message.reply(client.replies.noLogin);
    const URL = `https://last.fm/user/${user.get(`lastFMUsername`)}`;
    const userCrowns = await Crowns.findAll({
      attributes: [`guildID`, `userID`, `artistName`, `artistPlays`]
    },
    {
      where: {
        userID: message.author.id,
        guildID: message.guild.id
      }
    });
    let num = 0;
    const description = userCrowns
      .map(x => {
        return {
          name: x.artistName,
          plays: parseInt(x.artistPlays),
          userID: x.userID,
          guildID: x.guildID
        };
      })
      .filter(x => x.userID === message.author.id &&
      message.guild.id)
      .sort((a,b) => b.plays - a.plays)
      .slice(0, 10)
      .map(x => `${++num}. **${x.name}** with ${x.plays} plays`)
      .join(`\n`) + `\n\nTotal amount of crowns: **${userCrowns.length}**`;
    const title = `Crowns of ${user.get(`lastFMUsername`)} ` +
    `in ${message.guild.name}`;
    if (description.length === 0)
      return message.reply(`you have no crowns in this guild.`);
    const embed = new RichEmbed()
      .setTitle(title)
      .setColor(message.member.displayColor)
      .setURL(URL)
      .setDescription(description)
      .setFooter(`Command invoked by ${message.author.tag}`)
      .setTimestamp()
      .setThumbnail(message.author.avatarURL);
    const msg = await message.channel.send({ embed });
    if (userCrowns.length > 10) {
      await msg.react(`⬅`);
      await msg.react(`➡`);
      await msg.react(`❌`);
      let page = 0;
      let finalPage = Math.ceil(userCrowns.length / 10);

      const listenKeys = async (reaction, user) => {
        if (reaction.message.id === msg.id && user.id === message.author.id) {
          if (reaction.emoji.name === `⬅` && page !== 0) {
            page--;
            const offset = page * 10;
            let num = offset;
            const description = userCrowns
              .map(x => {
                return {
                  name: x.artistName,
                  plays: parseInt(x.artistPlays)
                };
              })
              .sort((a,b) => b.plays - a.plays)
              .slice(offset, offset + 10)
              .map(x => `${++num}. **${x.name}** with ${x.plays} plays`)
              .join(`\n`) + `\n\nTotal amount of crowns: ` +
              `**${userCrowns.length}**`;
            const embed = new RichEmbed()
              .setTitle(title)
              .setColor(message.member.displayColor)
              .setURL(URL)
              .setDescription(description)
              .setFooter(`Command invoked by ${message.author.tag}`)
              .setTimestamp()
              .setThumbnail(message.author.avatarURL);
            await msg.edit({ embed });
          } else if (reaction.emoji.name === `➡` && page !== finalPage) {
            page++;
            const offset = page * 10;
            let num = offset;
            const description = userCrowns
              .map(x => {
                return {
                  name: x.artistName,
                  plays: parseInt(x.artistPlays)
                };
              })
              .sort((a,b) => b.plays - a.plays)
              .slice(offset, offset + 10)
              .map(x => `${++num}. **${x.name}** with ${x.plays} plays`)
              .join(`\n`) + `\n\nTotal amount of crowns: ` +
              `**${userCrowns.length}**`;
            const embed = new RichEmbed()
              .setTitle(title)
              .setColor(message.member.displayColor)
              .setURL(URL)
              .setDescription(description)
              .setFooter(`Command invoked by ${message.author.tag}`)
              .setTimestamp()
              .setThumbnail(message.author.avatarURL);
            await msg.edit({ embed });
          } else if (reaction.emoji.name === `❌`) {
            await msg.delete();
          }
        }
      };

      client.on(`messageReactionAdd`, listenKeys);
      client.on(`messageReactionRemove`, listenKeys);
    }
  } catch (e) {
    console.error(e);
    await message.channel.send(client.replies.error);
  }
};

exports.help = {
  name: `crowns`,
  description: `Shows you all crowns of artists you have. Once you listen to ` +
  `a certain artist the most in the guild, you get a crown of that artist in ` +
  `the guild.`,
  usage: `crowns`,
  notes: `Crowns are updated every time someone invokes a \`whoknows\` command.`
};
