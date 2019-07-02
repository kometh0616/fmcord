const Command = require(`../classes/Command`);
const { RichEmbed } = require(`discord.js`);

class CrownboardCommand extends Command {

  constructor() {
    super({
      name: `crownboard`,
      description: `Provides you a list of people with the most crowns in the guild.`,
      usage: `crownboard`,
      aliases: [`cb`],
    });
  }

  async run(message) {
    this.setContext(message);
    try {
      let num = 0;
      const Crowns = message.client.sequelize.import(`../models/Crowns.js`);
      const users = await Crowns.findAll({
        where: {
          guildID: message.guild.id
        }
      });
      let amounts = new Map();
      const base = users
        .filter(u => message.guild.members.has(u.userID));
      base.forEach(u => {
        if (amounts.has(u.userID)) {
          let amount = amounts.get(u.userID);
          amounts.set(u.userID, ++amount);
        } else {
          amounts.set(u.userID, 1);
        }
      });
      amounts = Array.from(amounts).sort((a, b) => b[1] - a[1]);
      const authorPos = amounts.findIndex(x => x[0] === message.author.id);
      let desc = amounts
        .slice(0, 10)
        .map(x => `${++num}. **${message.client.users.get(x[0]).username}** with ${x[1]} crowns`)
        .join(`\n`);
      if (authorPos !== -1) desc += `\n\nYour position is: ${authorPos + 1}`;
      const embed = new RichEmbed()
        .setTitle(`${message.guild.name}'s crown leaderboard`)
        .setColor(message.member.displayColor)
        .setThumbnail(message.guild.iconURL)
        .setDescription(desc)
        .setFooter(`Command executed by ${message.author.tag}`)
        .setTimestamp();
      await message.channel.send({ embed });
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = CrownboardCommand;
