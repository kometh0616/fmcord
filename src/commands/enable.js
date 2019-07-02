const Command = require(`../classes/Command`);

class EnableCommand extends Command {

  constructor() {
    super({
      name: `enable`,
      description: `Enables a command if it as previously disabled.`,
      usage: `enable <command>`,
      notes: `This command requires Manage Server permission. Can be overriden ` +
      `if you have Administrator permissions, or if you are an owner of the guild.`,
      permissions: {
        user: `MANAGE_GUILD`,
        bot: 0,
      }
    });
  }

  async run(message, args) {
    this.setContext(message);
    try {
      const Disables = message.client.sequelize.import(`../models/Disables.js`);
      const isValid = message.client.commands.has(args[0].toLowerCase());
      if (!isValid) {
        await message.reply(`I don't recognise a command ${args[0]}.`);
        this.context.reason = `No such command found.`;
        throw this.context;
      }
      const dbParams = {
        where: {
          guildID: message.guild.id,
          cmdName: args[0].toLowerCase()
        }
      };
      const disabled = await Disables.findOne(dbParams);
      if (!disabled) {
        await message.reply(`command \`${args[0].toLowerCase()}\` wasn't ` +
        `disabled previously.`);
      }
      if (disabled.guildDisabled) await Disables.destroy({
        where: {
          guildID: message.guild.id,
          cmdName: args[0].toLowerCase(),
          guildDisabled: true
        }
      });
      else await Disables.destroy({
        where: {
          guildID: message.guild.id,
          channelID: message.channel.id,
          cmdName: args[0].toLowerCase(),
        }
      });
      await message.reply(`command \`${args[0].toLowerCase()}\` enabled ` +
      `in ${disabled.guildDisabled ? message.guild.name : `this channel`} ` +
      `succesfully!`);
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = EnableCommand;
