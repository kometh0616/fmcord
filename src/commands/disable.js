exports.run = async (client, message, args) => {
  try {
    if (!message.member.hasPermission(`MANAGE_GUILD`, false, true, true))
      return message.reply(`you don't have a **Manage Server** permission ` +
    `to invoke this command.`);
    const Disables = client.sequelize.import(`../models/Disables.js`);
    const disable = async () => {
      const isValid = client.commands.has(args[0].toLowerCase());
      if (!isValid) return message.reply(`I don't recognise a command ` +
      `${args[0]}.`);
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
      if (isDisabled.guildDisabled) return message.reply(`this command is ` +
      `already disabled in an entire guild! To re-enable it, do ` +
      `\`${client.config.prefix}enable <command>\`.`);
      else if (isDisabled.channelID !== message.channel.id) disable();
      else return message.reply(`this command is ` +
      `already disabled in this channel! To re-enable it, do ` +
      `\`${client.config.prefix}enable <command>\`.`);
    } else disable();
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `disable`,
  description: `Disables a command from usage in either an entire guild or ` +
  `a certain channel.`,
  usage: `disable <command> [--guild]`,
  notes: `This command requires Manage Server permission.`
};
