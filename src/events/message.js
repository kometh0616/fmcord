module.exports = async (client, message) => {
  if (message.author.bot || !message.content.startsWith(client.config.prefix))
    return;
  else {
    try {
      const Disables = client.sequelize.import(`../models/Disables.js`);
      const args = message.content.slice(client.config.prefix.length).split(/ +/);
      const commandName = args.shift().toLowerCase();
      const Command = client.commands.find(Com => {
        const com = new Com();
        return com.name === commandName || (com.aliases && com.aliases.includes(commandName));
      });
      if (!Command) {
        return;
      }
      const command = new Command();
      const isDisabled = await Disables.findOne({
        where: {
          guildID: message.guild.id,
          cmdName: command.name
        }
      });
      if (!command.dmAvailable && !message.guild) {
        return message.reply(`I cannot run command \`${command.name}\` inside ` +
        `a DM channel.`);
      } else if (message.guild && !message.guild.me.hasPermission(
        command.permissions.bot, false, true, true
      )) {
        return message.reply(`I do not have a permission \`${command.permissions.bot}\` `+
        `to run a command \`${command.name}\`.`);
      } else if (message.guild && !message.member.hasPermission(
        command.permissions.user, false, true, true
      )) {
        return message.reply(`you do not have a permission ` +
        `\`${command.permissions.user}\` to run command \`${command.name}\`.`);
      } else if (command.botOwnerOnly && message.author.id !== client.config.botOwnerID) {
        return;
      } else if (command.cooldown) {
        const isCooled = client.cooldowns.find(x => {
          return x.name === command.name &&
          x.userID === message.author.id;
        });
        if (isCooled) {
          return message.reply(`command \`${command.name}\` is on a cooldown. ` +
          `Please wait ${Math.floor((isCooled.uncooledAt - Date.now()) / 1000)} ` +
          `seconds before you can use the command.`);
        }
      }
      if (isDisabled) {
        if (isDisabled.guildDisabled) {
          return message.reply(`command \`${command.name}\` is disabled in ` +
          `${message.guild.name}.`);
        } else if (isDisabled.channelID === message.channel.id) {
          return message.reply(`command \`${command.name}\` is disabled in ` +
          `this channel.`);
        }
      }
      const ctx = await command.run(message, args);
      let log = `Command ${ctx.name} executed!\n` +
      `Message content: ${ctx.message.content} (${ctx.message.id})\n` +
      `Executor: ${ctx.author.tag} (${ctx.author.id})\n`;
      if (ctx.channel.name) {
        log += `Channel of execution: ${ctx.channel.name} (${ctx.channel.id})\n`;
      } else {
        log += `Channel of execution: ${ctx.channel.id}\n`;
      }
      if (ctx.guild) {
        log += `Guild of execution: ${ctx.guild.name} (${ctx.guild.id})\n`;
      }
      log += `Timestamp: ${ctx.timestamp}\n`;
      console.log(log);
      if (command.cooldown) {
        client.cooldowns.push({
          name: command.name,
          userID: message.author.id,
          uncooledAt: Date.now() + command.cooldown,
        });
        setTimeout(() => {
          client.cooldowns = client.cooldowns.filter(x => {
            x.name !== command.name && x.userID === message.author.id;
          });
        }, command.cooldown);
      }
    } catch (e) {
      if (e.isContext) {
        let log = `Command ${e.name} failed to execute!\n` +
        `Message content: ${e.message.content} (${e.message.id})\n` +
        `Executor: ${e.author.tag} (${e.author.id})\n`;
        if (e.channel.name) {
          log += `Channel of execution: ${e.channel.name} (${e.channel.id})\n`;
        } else {
          log += `Channel of execution: ${e.channel.id}\n`;
        }
        if (e.guild) {
          log += `Guild of execution: ${e.guild.name} (${e.guild.id})\n`;
        }
        log += `Timestamp: ${e.timestamp}\n`;
        if (e.reason) {
          log += `Reason: ${e.reason}\n`;
        }
        if (e.stack) {
          log += `Stack: ${e.stack}\n`;
          await message.channel.send(client.snippets.error);
        }
        console.error(log);
      } else {
        console.error(e);
      }
    }
  }
};
