const { RichEmbed } = require(`discord.js`);
exports.run = async (client, message, args) => {
  const { prefix, botOwnerID } = client.config;
  try {
    if (args[0] === `--manual`) {
      const haveHelp = client.commands.filter(x => x.help);
      const amount = haveHelp.size;
      const sorted = [...haveHelp.sort((x, y) => x.help.name - y.help.name)];
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
      const msg = await message.channel.send({embed});
      await msg.react(`⬅`);
      await msg.react(`➡`);
      await msg.react(`❌`);
      const filter = (r, u) => [`⬅`, `➡`, `❌`].includes(r.emoji.name) &&
        u.id === message.author.id;
      const collector = await msg.createReactionCollector(filter, {
        time: 60000
      });
      collector.on(`collect`, async reaction => {
        await reaction.remove(message.author);
        if (reaction.emoji.name === `⬅` && currentPage !== 0) {
          const embed = new RichEmbed()
            .setColor(message.member.displayColor)
            .setTitle(`Command ${sorted[--currentPage][1].help.name}`)
            .addField(`Description:`, sorted[currentPage][1].help.description)
            .addField(`Usage:`, `${prefix}${sorted[currentPage][1].help.usage}`)
            .setTimestamp()
            .setFooter(`Command invoked by ${message.author.tag} | ` +
            `${currentPage + 1}/${amount} pages`);
          if (sorted[currentPage][1].help.notes)
            embed.addField(`Note:`, sorted[currentPage][1].help.notes);
          await msg.edit({embed});
        } else if (reaction.emoji.name === `➡` && currentPage !== amount) {
          const embed = new RichEmbed()
            .setColor(message.member.displayColor)
            .setTitle(`Command ${sorted[++currentPage][1].help.name}`)
            .addField(`Description:`, sorted[currentPage][1].help.description)
            .addField(`Usage:`, `${prefix}${sorted[currentPage][1].help.usage}`)
            .setTimestamp()
            .setFooter(`Command invoked by ${message.author.tag} | ` +
            `${currentPage + 1}/${amount} pages`);
          if (sorted[currentPage][1].help.notes)
            embed.addField(`Note:`, sorted[currentPage][1].help.notes);
          await msg.edit({embed});
        } else if (reaction.emoji.name === `❌`) {
          await msg.delete();
          await collector.stop();
        }
      });
    } else {
      let helpMessage = ``;
      for (const [name, com] of client.commands)
        if (com.help)
          helpMessage += `**${prefix}${name}** - ${com.help.description}\n`;
      await message.channel.send(helpMessage);
    }
  } catch (e) {
    console.error(e);
    await message.channel.send(`<@${botOwnerID}>, something is NOT ok.`);
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
