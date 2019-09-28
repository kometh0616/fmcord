const Command = require(`../classes/Command`);

class CrownsCommand extends Command {

  constructor() {
    super({
      name: `crowns`,
      description: `Shows you all crowns of artists you have. Once you listen to ` +
      `a certain artist the most in the guild, you get a crown of that artist in ` +
      `the guild.`,
      usage: [`crowns`, `crowns notify`, `crowns ban <user>`, `crowns unban <user>`, `crowns reset <user>`],
      notes: `This feature is now deprecated. Please visit https://github.com/ `+
      `kometh0616/crown-bot for more information.`,
      aliases: [`cw`],
    });
  }

  async run(client, message) {
    this.setContext(message);
    try {
      await message.channel.send(`This feature has been deprecated. Please visit ` +
      `https://github.com/kometh0616/crown-bot for more information.`);
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.stack;
    }
  }

}

module.exports = CrownsCommand;
