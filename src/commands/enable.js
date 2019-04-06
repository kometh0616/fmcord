exports.run = async (client, message, args) => {
  try {
    if (!message.member.hasPermission(`MANAGE_GUILD`, false, true, true))
      return message.reply(`you don't have a **Manage Server** permission ` +
    `to invoke this command.`);
    const Disables = client.sequelize.import(`../models/Disables.js`);
    const isValid = client.commands.has(args[0].toLowerCase());
    if (!isValid) return message.reply(`I don't recognise a command ` +
      `${args[0]}.`);
    let dbParams = {
      where: {
        guildID: message.guild.id,
        cmdName: args[0].toLowerCase()
      }
    };
    const disabled = await Disables.findOne(dbParams);
    if (!disabled) return message.reply(`command ` +
    `\`${args[0].toLowerCase()}\` wasn't disabled previously.`);
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
  } catch (e) {
    console.error(e);
    await message.channel.send(client.replies.error);
  }
};

exports.help = {
  name: `enable`,
  description: `Enables a command if it as previously disabled.`,
  usage: `enable <command>`,
  notes: `This command requires Manage Server permission.`
};
