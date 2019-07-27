const Command = require(`../classes/Command`);

class PingCommand extends Command {

  constructor() {
    super({
      name: `ping`,
      description: `Tells you your ping.`,
      usage: `ping`,
      dmAvailable: true,
    });
  }

  async run(client, message) {
    this.setContext(message);
    try {
      const oldDate = Date.now();
      const msg = await message.channel.send(`Pong!`);
      const newDate = Date.now() - oldDate;
      await msg.edit(`Pong! Your ping is ${newDate}ms.`);
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = PingCommand;
