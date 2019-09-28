const Command = require(`../classes/Command`);
const { Op } = require(`sequelize`);

class EnableCommand extends Command {

  constructor() {
    super({
      name: `enable`,
      description: `Enables a command if it as previously disabled.`,
      usage: [`enable <command>`],
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
      const Disables = client.sequelize.import(`../models/Disables.js`);
      const isValid = client.commands.has(args[0].toLowerCase());
      if (!isValid) {
        await message.reply(`I don't recognise a command ${args[0]}.`);
        this.context.reason = `No such command found.`;
        throw this.context;
      } else if (args[0].toLowerCase() === this.name || args[0].toLowerCase() === `enable`) {
        await message.reply(`I cannot enable command \`${args[0]}\`.`);
        this.context.reason = `Immune command.`;
        throw this.context;
      }
      const dbParams = {
        where: {
          discordID: {
            [Op.or]: [message.guild.id, message.channel.id]
          },
          cmdName: args[0].toLowerCase()
        }
      };
      const disabled = await Disables.findOne(dbParams);
      if (!disabled) {
        await message.reply(`command \`${args[0].toLowerCase()}\` wasn't ` +
        `disabled previously.`);
        this.context.reason = `Command wasn't disabled previously.`;
        throw this.context;
      }
      if (disabled.discordID === message.channel.id) {
        await Disables.destroy({
          where: {
            discordID: message.channel.id,
            cmdName: args[0].toLowerCase()
          }
        });
      } else {
        const IDs = message.guild.channels.filter(x => x.type === `text`)
          .map(x => x.id);
        await Disables.destroy({
          where: {
            discordID: [...IDs, message.guild.id],
            cmdName: args[0].toLowerCase()
          }
        });
      }
      const disabledIn = disabled.discordID === message.channel.id ? `this channel` : message.guild.name;
      await message.reply(`command \`${args[0].toLowerCase()}\` enabled ` +
      `in ${disabledIn} succesfully!`);
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = EnableCommand;
