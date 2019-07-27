const Command = require(`../classes/Command`);

class SourceCommand extends Command {

  constructor() {
    super({
      name: `source`,
      description: `Sends you a link to FMcord's GitHub repository. If a command ` +
      `name is provided, links you to the source of the provided command.`,
      usage: `source [<command name>]`,
      notes: `You must provide a full command name, not a shortcut.`,
      aliases: [`src`],
      dmAvailable: true,
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      if (!args[0]) {
        await message.channel.send(`Here is a FMcord GitHub repository: ` +
        client.snippets.github);
      } else {
        const cmd = args[0].toLowerCase();
        if (!client.commands.has(cmd)) {
          await message.reply(`I can't find a command called \`${cmd}\`.`);
          this.context.reason = `Couldn't find the command.`;
          throw this.context;
        }
        await message.channel.send(`Here is source to a command \`${cmd}\`: ` +
        client.snippets.getSource(cmd));
      }
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = SourceCommand;
