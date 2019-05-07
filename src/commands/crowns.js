const { RichEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const ReactionInterface = require(`../utils/ReactionInterface`);

exports.run = async (client, message) => {
  try {
    const fetchUser = new fetchuser(client, message);
    const Crowns = client.sequelize.import(`../models/Crowns.js`);
    const user = await fetchUser.get();
    if (!user) return message.reply(client.snippets.noLogin);
    const URL = `https://last.fm/user/${user.get(`lastFMUsername`)}`;
    const userCrowns = await Crowns.findAll({
      where: {
        userID: message.author.id,
        guildID: message.guild.id
      }
    });
    let num = 0;
    const validCrowns = userCrowns
      .map(x => {
        return {
          name: x.get(`artistName`),
          plays: parseInt(x.get(`artistPlays`)),
          userID: x.get(`userID`),
          guildID: x.get(`guildID`)
        };
      })
      .filter(x => message.guild.id === x.guildID
      && message.author.id === x.userID);
    if (validCrowns.length === 0)
      return message.reply(`you have no crowns in this guild.`);
    const description = validCrowns
      .sort((a,b) => b.plays - a.plays)
      .slice(0, 10)
      .map(x => `${++num}. **${x.name}** with ${x.plays} plays`)
      .join(`\n`) + `\n\nTotal amount of crowns: **${validCrowns.length}**`;
    const title = `Crowns of ${user.get(`lastFMUsername`)} ` +
    `in ${message.guild.name}`;
    const footer = `Command invoked by ${message.author.tag}`;
    if (description.length === 0)
      return message.reply(`you have no crowns in this guild.`);
    const embed = new RichEmbed()
      .setTitle(title)
      .setColor(message.member.displayColor)
      .setURL(URL)
      .setDescription(description)
      .setFooter(footer)
      .setTimestamp()
      .setThumbnail(message.author.avatarURL);
    const msg = await message.channel.send({ embed });
    if (validCrowns.length > 10) {
      const rl = new ReactionInterface(msg, message.author);
      const length = Math.ceil(userCrowns.length / 10);
      let offset = 0, page = 1;
      const func = async off => {
        let num = off;
        const description = validCrowns
          .sort((a, b) => b.plays - a.plays)
          .slice(off, off + 10)
          .map(x => `${++num}. **${x.name}** with ${x.plays} plays`)
          .join(`\n`) + `\n\nTotal amount of crowns: **${validCrowns.length}**`;
        const embed = new RichEmbed()
          .setTitle(title)
          .setColor(message.member.displayColor)
          .setURL(URL)
          .setDescription(description)
          .setFooter(`Command invoked by ${message.author.tag}`)
          .setTimestamp()
          .setThumbnail(message.author.avatarURL);
        await msg.edit({ embed });
      };
      const toFront = () => {
        if (page !== length) {
          offset += 10, page++;
          func(offset);
        }
      };
      const toBack = () => {
        if (page !== 1) {
          offset -= 10, page--;
          func(offset);
        }
      };
      await rl.setKey(client.snippets.arrowLeft, toBack);
      await rl.setKey(client.snippets.arrowRight, toFront);
      await rl.setKey(client.snippets.exit, rl.destroy);
    }
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
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
