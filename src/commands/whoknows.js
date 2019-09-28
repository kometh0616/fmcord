const Command = require(`../classes/Command`);

class WhoKnowsCommand extends Command {

  constructor() {
    super({
      name: `whoknows`,
      description: `Checks if anyone in a guild listens to a certain artist. If ` +
      `no artist is defined, the bot will try to look up an artist you are ` +
      `currently listening to.`,
      usage: [`whoknows`, `whoknows <artist name>`],
      notes: `This feature is now deprecated. Please visit https://github.com/ `+
      `kometh0616/crown-bot for more information.`,
      aliases: [`w`]
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

module.exports = WhoKnowsCommand;
