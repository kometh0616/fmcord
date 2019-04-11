const { RichEmbed } = require(`discord.js`);
exports.run = async (client, message, args) => {
  const { prefix } = client.config;
  try {
    if (args[0] === `--manual`) {
      const haveHelp = client.commands.filter(x => x.help);
      const amount = haveHelp.size;
      const sorted = [...haveHelp.sort((x, y) => x.help.name - y.help.name)];
      const updateEmbed = it => {
        const embed = new RichEmbed()
          .setColor(message.member.displayColor)
          .setTitle(`Command ${sorted[it][1].help.name}`)
          .addField(`Description:`, sorted[it][1].help.description)
          .addField(`Usage:`, `${prefix}${sorted[it][1].help.usage}`)
          .setTimestamp()
          .setFooter(`Command invoked by ${message.author.tag} | ` +
          `${it + 1}/${amount} pages`);
        if (sorted[it][1].help.notes)
          embed.addField(`Note:`, sorted[it][1].help.notes);
        return embed;
      };
      let currentPage = 0;
      const embed = new RichEmbed()
        .setColor(message.member.displayColor)
        .setTitle(`Command ${sorted[currentPage][1].help.name}`)
        .addField(`Description:`, sorted[currentPage][1].help.description)
        .addField(`Usage:`, `${prefix}${sorted[currentPage][1].help.usage}`)
        .setTimestamp()
        .setFooter(`Command invoked by ${message.author.tag} | ` +
        `${currentPage + 1}/${amount} pages`);
      if (sorted[currentPage][1].help.notes)
        embed.addField(`Note:`, sorted[currentPage][1].help.notes);
      const msg = await message.channel.send({ embed });
      await msg.react(`⬅`);
      await msg.react(`➡`);
      await msg.react(`❌`);
      client.on(`messageReactionAdd`, async (reaction, user) => {
        if (reaction.message.id === msg.id &&
            user.id === message.author.id) {
          if (reaction.emoji.name === `⬅` && currentPage !== 0) {
            currentPage--;
            const embed = updateEmbed(currentPage);
            await msg.edit({ embed });
          } else if (reaction.emoji.name === `➡` && currentPage !== amount - 1) {
            currentPage++;
            const embed = updateEmbed(currentPage);
            await msg.edit({ embed });
          } else if (reaction.emoji.name === `❌`) {
            await msg.delete();
          }
        }
      });
      client.on(`messageReactionRemove`, async (reaction, user) => {
        if (reaction.message.id === msg.id &&
            user.id === message.author.id) {
          if (reaction.emoji.name === `⬅` && currentPage !== 0) {
            currentPage--;
            const embed = updateEmbed(currentPage);
            await msg.edit({ embed });
          } else if (reaction.emoji.name === `➡` && currentPage !== amount - 1) {
            currentPage++;
            const embed = updateEmbed(currentPage);
            await msg.edit({ embed });
          } else if (reaction.emoji.name === `❌`) {
            await msg.delete();
          }
        }
      });
    } else {
      const helpMessage = client.commands
        .filter(x => x.help)
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
  `and manage reactions to messages.`
};
