const Command = require(`../classes/Command`);

class CrownboardCommand extends Command {

  constructor() {
    super({
      name: `crownboard`,
      description: `Provides you a list of people with the most crowns in the guild.`,
      usage: [`crownboard`],
      aliases: [`cb`],
      notes: `This feature is now deprecated. Please visit https://github.com/ `+
      `kometh0616/crown-bot for more information.`,
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

module.exports = CrownboardCommand;
