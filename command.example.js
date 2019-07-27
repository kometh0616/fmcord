/* eslint-disable */

const Command = require(`../classes/Command`);

class ExampleCommand extends Command {
  constructor() {
    super({
      name: `example`,
      description: `This is an example command. You must use it as an ` +
      `example/template for your developed commands.`,
      usage: `example`,
      notes: `The following properties, including this one, are optional. ` +
      `"dmAvailable" property will be set to false by default. Cooldowns ` +
      `must be expressed in seconds. `,
      aliases: [`e, ex`],
      cooldown: 3,
      dmAvailable: true,
      botOwnerOnly: true,
      helpExempt: true,
      permissions: {
        user: `SEND_MESSAGES`,
        bot: `MANAGE_MESSAGES`,
      }
    });
  }

  async run(client, message, args) /* "args" argument can be omitted. */ {
    this.setContext(message);
    try {
      // Code that will be run by the bot during the command execution goes here.
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = ExampleCommand;
