const { RichEmbed } = require(`discord.js`);
const ReactionInterface = require(`../utils/ReactionInterface`);
exports.run = async (client, message, args) => {
  const { prefix } = client.config;
  const commandsWithHelp = client.commands.filter(x => x.help);
  try {
    if (args[0] === `--manual`) {
      const color = message.member ? message.member.displayColor : 16777215;
      let pages = 0;
      const embeds = commandsWithHelp
        .map(x => {
          const embed = new RichEmbed()
            .setColor(color)
            .setTitle(`Command ${x.help.name}`)
            .addField(`Description:`, x.help.description)
            .addField(`Usage:`, `${prefix}${x.help.usage}`)
            .setFooter(`Page ${++pages}/${commandsWithHelp.size} | ` +
            `Command executed by ${message.author.tag}`, message.author.avatarURL)
            .setTimestamp();
          if (x.help.notes) embed.addField(`Notes:`, x.help.notes);
          return embed;
        });
      let index = 0;
      const embed = embeds[index];
      const msg = await message.channel.send({ embed });
      const rl = new ReactionInterface(msg, message.author);
      await rl.setKey(client.snippets.arrowLeft, async () => {
        if (index !== 0) {
          const embed = embeds[--index];
          await msg.edit({ embed });
        }
      });
      await rl.setKey(client.snippets.arrowRight, async () => {
        if (index !== commandsWithHelp.size - 1) {
          const embed = embeds[++index];
          await msg.edit({ embed });
        }
      });
      await rl.setKey(client.snippets.exit, rl.destroy);
    } else {
      const helpMessage = commandsWithHelp
        .map(x => `**${prefix}${x.help.name}** - ${x.help.description}`)
        .join(`\n`);
      await message.channel.send(helpMessage);
    }
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `help`,
  description: `Shows you this help message. Add a flag \`--manual\` for an ` +
  `interactive manual.`,
  usage: `help [--manual]`,
  notes: `Interactive manual will only work if a bot has a permission to add ` +
  `reactions to messages.`
};
