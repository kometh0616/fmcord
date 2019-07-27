const Command = require(`../classes/Command`);

class InviteCommand extends Command {

  constructor() {
    super({
      name: `invite`,
      description: `Sends you a bot invitation link, by which you can invite this ` +
      `bot to your server.`,
      usage: `invite`,
      aliases: [`i`, `botinvite`],
      dmAvailable: true,
    });
  }

  async run(client, message) {
    this.setContext(message);
    try {
      await message.reply(`you can invite me to your server using this link: ` +
      `${client.snippets.dBotsLink}`);
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = InviteCommand;
