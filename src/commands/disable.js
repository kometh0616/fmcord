const Command = require(`../classes/Command`);

class DisableCommand extends Command {

  constructor() {
    super({
      name: `disable`,
      description: `Disables a command from usage in either an entire guild or ` +
      `a certain channel.`,
      usage: `disable <command> [--guild]`,
      notes: `This command requires Manage Server permission. Can be overriden ` +
      `if you have Administrator permissions, or if you are an owner of the guild.`,
      permissions: {
        user: `MANAGE_GUILD`,
        bot: 0,
      }
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      if (!args[0]) {
        await message.reply(`please define a command you want to disable!`);
        this.context.reason = `No command specified.`;
        throw this.context;
      }
      const Disables = client.sequelize.import(`../models/Disables.js`);
      const disable = async () => {
        const isValid = client.commands.has(args[0].toLowerCase());
        if (!isValid) {
          await message.reply(`I don't recognise a command ${args[0]}.`);
          this.context.reason = `No such command found.`;
          throw this.context;
        }
        const guildFlag = args[1] === `--guild`;
        let dbParams = {
          guildID: message.guild.id,
          channelID: message.channel.id,
          cmdName: args[0].toLowerCase(),
        };
        const reply = `command \`${args[0].toLowerCase()}\` was succesfully ` +
        `disabled in ${guildFlag ? message.guild.name : `this channel`}!`;
        if (guildFlag) dbParams = {
          guildID: message.guild.id,
          cmdName: args[0].toLowerCase(),
          guildDisabled: true,
        };
        await Disables.create(dbParams);
        await message.reply(reply);
      };
      const isDisabled = await Disables.findOne({
        where: {
          guildID: message.guild.id,
          cmdName: args[0].toLowerCase()
        }
      });
      if (isDisabled) {
        if (isDisabled.guildDisabled) await message.reply(`this command is ` +
        `already disabled in an entire guild! To re-enable it, do ` +
        `\`${client.config.prefix}enable <command>\`.`);
        else if (isDisabled.channelID !== message.channel.id) disable();
        else await message.reply(`this command is ` +
        `already disabled in this channel! To re-enable it, do ` +
        `\`${client.config.prefix}enable <command>\`.`);
      } else disable();
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = DisableCommand;
