const Command = require(`../classes/Command`);
const { RichEmbed } = require(`discord.js`);
const ReactionInterface = require(`../utils/ReactionInterface`);

class HelpCommand extends Command {

  constructor() {
    super({
      name: `help`,
      description: `Shows you this help message. Add a flag \`--manual\` for an ` +
      `interactive manual.`,
      usage: `help [--manual]`,
      notes: `Interactive manual will only work if a bot has a permission to add ` +
      `reactions to messages.`,
      aliases: [`h`],
      permissions: {
        user: 0,
        bot: 0
      },
      dmAvailable: true,
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      const color = message.guild ? message.member.displayColor : 16777215;
      const helpCommands = client.commands
        .map(Cmd => new Cmd())
        .filter(x => !x.helpExempt);
      if (args[0] === `--manual`) {
        if (message.guild && !message.guild.me.hasPermission(`ADD_REACTIONS`, false, true, true)) {
          await message.reply(`I do not have an \`Add reactions\` permission ` +
          `to execute this command.`);
          this.context.reason = `Insufficient permissions.`;
          throw this.context;
        }
        let pages = 0;
        const embeds = helpCommands.map(x => {
          const embed = new RichEmbed()
            .setColor(color)
            .setTitle(`Command ${x.name}`)
            .addField(`Usage:`, `${client.config.prefix}${x.usage}`)
            .addField(`Description:`, x.description)
            .setFooter(`Page ${++pages}/${helpCommands.length} | Command ` +
            `executed by ${message.author.tag}`, message.author.avatarURL)
            .setTimestamp();
          if (x.notes) {
            embed.addField(`Notes:`, x.notes);
          }
          if (x.aliases.length > 0) {
            embed.addField(`Shortcuts:`, x.aliases.join(`, `));
          }
          return embed;
        });
        let index = 0;
        const embed = embeds[index];
        const msg = await message.channel.send({ embed });
        const rI = new ReactionInterface(msg, message.author);
        await rI.setKey(client.snippets.arrowLeft, async () => {
          if (index !== 0) {
            const embed = embeds[--index];
            await msg.edit({ embed });
          }
        });
        await rI.setKey(client.snippets.arrowRight, async () => {
          if (index !== helpCommands.size - 1) {
            const embed = embeds[++index];
            await msg.edit({ embed });
          }
        });
        await rI.setKey(client.snippets.exit, rI.destroy);
      } else {
        const commandName = args[0];
        if (!commandName) {
          const commands = helpCommands
            .map(x => `\`${x.name}\``)
            .join(`, `);
          const embed = new RichEmbed()
            .setTitle(`FMcord's commands`)
            .setThumbnail(client.user.avatarURL)
            .setColor(color)
            .setDescription(`Do \`${client.config.prefix}help ` +
            `<command name>\` to get more information on a command!`)
            .addField(`Available commands`, commands)
            .setFooter(`Command executed by ${message.author.tag}`, message.author.avatarURL)
            .setTimestamp();
          await message.channel.send({ embed });
        } else {
          const command = helpCommands.find(com => {
            return com.name === commandName || com.aliases.includes(commandName);
          });
          if (!command) {
            await message.reply(`I couldn't find a command, called \`${commandName}\`.`);
            this.context.reason = `Couldn't find the command.`;
            throw this.context;
          }
          const embed = new RichEmbed()
            .setColor(color)
            .setTitle(`Command ${command.name}`)
            .addField(`Usage:`, command.usage)
            .setFooter(`Command executed by ${message.author.tag}`, message.author.avatarURL)
            .setTimestamp();
          if (command.notes) {
            embed.addField(`Notes:`, command.notes);
          }
          if (command.aliases) {
            embed.addField(`Shortcuts:`, command.aliases.join(`, `));
          }
          await message.channel.send({ embed });
        }
      }
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = HelpCommand;
