const { RichEmbed } = require(`discord.js`);

class FMcordEmbed extends RichEmbed {
  
  constructor(message) {
    super().setColor(message.member ? message.member.displayColor : 16777215)
      .setFooter(`Command executed by ${message.author.tag}`, message.author.avatarURL)
      .setTimestamp();
  }

}

module.exports = FMcordEmbed;