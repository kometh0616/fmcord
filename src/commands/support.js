const Command = require(`../classes/Command`);

class SupportCommand extends Command {

  constructor() {
    super({
      name: `support`,
      description: `Provides you a link to FMcord Support server.`,
      usage: [`support`],
      notes: `If you are running this command in a guild, make sure the guild's ` +
      `rules allow posting Discord links in its channels, and that no other ` +
      `bot filters Discord invites sent from FMcord.`,
      dmAvailable: true,
    });
  }

  async run(client, message) {
    this.setContext(message);
    try {
      await message.channel.send(`Here is a server where you can ask questions, ` +
      `get help and support and provide feedback on FMcord: https://discord.gg/` +
      `BrJ6zEk`);
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = SupportCommand;
