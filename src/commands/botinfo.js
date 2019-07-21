const { RichEmbed } = require(`discord.js`);
const Command = require(`../classes/Command`);
const agePrint = require(`../utils/AgePrint`);

class BotinfoCommand extends Command {

  constructor() {
    super({
      name: `botinfo`,
      description: `Shows general information about FMcord.`,
      usage: `botinfo`,
      aliases: [`bi`],
      dmAvailable: true
    });
  }

  async run(message) {
    this.setContext(message);
    try {
      const dev = message.client.users.get(message.client.config.botOwnerID);
      const shared = message.client.guilds.filter(x => x.members.has(message.author.id));
      const color = message.member ? message.member.displayColor : 16777215;
      const { avatarURL, createdAt } = message.client.user;
      const embed = new RichEmbed()
        .setTitle(`FMcord information`)
        .setThumbnail(avatarURL)
        .addField(`Created at: `, `${createdAt.toUTCString()} (${agePrint(createdAt)} ago)`)
        .addField(`Total servers:`, message.client.guilds.size, true)
        .addField(`Total users:`, message.client.users.size, true)
        .addField(`Used library:`, `discord.js`, true)
        .addField(`Developed by:`, `${dev.tag} and contributors`, true)
        .addField(`Amount of servers shared with the command invoker:`, shared.size, true)
        .setFooter(`Command executed by ${message.author.tag}`, message.author.avatarURL)
        .setTimestamp()
        .setColor(color);
      await message.channel.send({ embed });
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = BotinfoCommand;
