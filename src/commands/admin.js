const Command = require(`../classes/Command`);
const { readdir } = require(`fs`).promises;

class AdminCommand extends Command {

  constructor() {
    super({
      name: `admin`,
      aliases: [`a`],
      dmAvailable: true,
      botOwnerOnly: true,
      helpExempt: true,
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      if (message.author.id !== client.config.botOwnerID) return;
      if (args.length === 0) {
        message.reply(`please specify an admin command you want to use!`);
        this.context.reason = `No sub-command provided.`;
        throw this.context;
      }
      const cmdName = args[0].toLowerCase();
      const dir = `${process.env.PWD}/src/commands/admin/`;
      const files = await readdir(dir);
      const command = files.find(x => x.startsWith(cmdName));
      if (!command) {
        message.reply(`no command named \`${args[0]}\` found.`);
        this.context.reason = `No sub-command found.`;
        throw this.context;
      }
      const cmd = require(`./admin/${command}`);
      const cmdArgs = args.slice(1);
      cmd.run(client, message, cmdArgs);
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = AdminCommand;
