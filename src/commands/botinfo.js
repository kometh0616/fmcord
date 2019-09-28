const { RichEmbed } = require(`discord.js`);
const Command = require(`../classes/Command`);
const agePrint = require(`../utils/AgePrint`);

class BotinfoCommand extends Command {

  constructor() {
    super({
      name: `botinfo`,
      description: `Shows general information about FMcord.`,
      usage: [`botinfo`],
      aliases: [`bi`],
      dmAvailable: true
    });
  }

  async run(client, message) {
    this.setContext(message);
    try {
      const users = await client.shard.fetchClientValues(`users.size`);
      const userSize = users.reduce((prev, user) => prev + user, 0);
      const guilds = await client.shard.fetchClientValues(`guilds.size`);
      const guildSize = guilds.reduce((prev, guild) => prev + guild, 0);
      const dev = await client.fetchUser(client.config.botOwnerID);
      const shared = await client.shard.broadcastEval(`
        this.guilds.filter(x => x.members.has('${message.author.id}')).size
      `);
      const sharedSize = shared.reduce((prev, shared) => prev + shared, 0);
      const color = message.member ? message.member.displayColor : 16777215;
      const { avatarURL, createdAt } = client.user;
      const embed = new RichEmbed()
        .setTitle(`FMcord information`)
        .setThumbnail(avatarURL)
        .addField(`Created at: `, `${createdAt.toUTCString()} (${agePrint(createdAt)} ago)`)
        .addField(`Total servers:`, guildSize, true)
        .addField(`Total users:`, userSize, true)
        .addField(`Used library:`, `discord.js`, true)
        .addField(`Developed by:`, `${dev.tag} and contributors`, true)
        .addField(`Amount of servers shared with the command invoker:`, sharedSize, true)
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
