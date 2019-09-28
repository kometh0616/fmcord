const Command = require(`../classes/Command`);
const { Op } = require(`sequelize`);

class DisableCommand extends Command {

  constructor() {
    super({
      name: `disable`,
      description: `Disables a command from usage in either an entire guild or ` +
      `a certain channel.`,
      usage: [`disable <command>`, `disable <command> [--guild]`],
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
      const guildFlag = args[1] === `--guild`;
      const disable = async () => {
        const isValid = client.commands.has(args[0].toLowerCase());
        if (!isValid) {
          await message.reply(`I don't recognise a command ${args[0]}.`);
          this.context.reason = `No such command found.`;
          throw this.context;
        } else if (args[0].toLowerCase() === this.name || args[0].toLowerCase() === `disable`) {
          await message.reply(`I cannot disable command \`${args[0]}\`.`);
          this.context.reason = `Immune command.`;
          throw this.context;
        }
        const dbParams = {
          discordID: guildFlag ? message.guild.id : message.channel.id,
          cmdName: args[0].toLowerCase(),
        };
        const reply = `command \`${args[0].toLowerCase()}\` was succesfully ` +
        `disabled in ${guildFlag ? message.guild.name : `this channel`}!`;
        await Disables.create(dbParams);
        await message.reply(reply);
      };
      const isDisabled = await Disables.findOne({
        where: {
          discordID: {
            [Op.or]: [message.guild.id, message.channel.id]
          },
          cmdName: args[0].toLowerCase()
        }
      });
      if (isDisabled) {
        const reply = `command \`${args[0]}\` is already disabled in `;
        if (isDisabled.discordID === message.channel.id) {
          if (guildFlag) {
            await disable();
          } else {
            await message.reply(`${reply}this channel.`);
          }
        } else if (isDisabled.discordID === message.guild.id) {
          await message.reply(`${reply}${message.guild.name}`);
        }
      } else {
        await disable();
      }
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = DisableCommand;
