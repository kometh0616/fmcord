const Command = require(`../classes/Command`);
const request = require(`../utils/Request`);
const { RichEmbed } = require(`discord.js`);

class GenreInfoCommand extends Command {
  
  constructor() {
    super({
      name: `genreinfo`,
      description: `Returns general information about a defined genre.`,
      usage: [`genreinfo <music genre>`, `genreinfo <music genre> lang:<language code>`],
      notes: `Only languages supported by Last.fm are supported. ` +
      `Information in some languages might be missing. Language codes ` +
      `are: en, de, es, fr, it, ja, pl, ru, sv, tr, zh. If a language ` +
      `is not defined, command defaults to English.`,
      aliases: [`g`, `gi`, `genre`],
      dmAvailable: true
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      const color = message.member ? message.member.displayColor : 16777215;
      if (!args[0]) {
        await message.reply(`you haven't defined a genre!`);
        this.context.reason = `Author hasn't provided a genre.`;
        throw this.context;
      }
      const langIndex = args.findIndex(x => x.startsWith(`lang:`));
      let genre, lang;
      if (langIndex === -1) {
        [genre, lang] = [args.join(` `), `en`];
      } else {
        const langs = client.snippets.languages.map(x => `\`${x}\``).join(`, `);
        genre = args.slice(0, langIndex).join(` `);
        lang = args[langIndex].split(`:`);
        if (lang[1]) {
          lang = lang[1];
          if (!client.snippets.languages.includes(lang)) {
            await message.reply(`language \`${lang}\` is not supported. ` +
            `Please choose between the following: ${langs}`);
            this.context.reason = `Unsupported language.`;
            throw this.context;
          }
        } else {
          await message.reply(`you haven't defined a language! Please choose between ` +
          `the following: ${langs}`);
          this.context.reason = `No language was provided.`;
          throw this.context;
        }
      }
      const data = await request({
        method: `tag.getinfo`,
        tag: genre,
        lang: lang
      });
      let { content } = data.tag.wiki;   
      content = content.replace(client.snippets.hrefRegex, ``);
      const { tag, avatarURL } = message.author;
      const embed = new RichEmbed()
        .setColor(color)
        .setTitle(`Information about ${data.tag.name}`)
        .addField(`Total uses of the genre:`, data.tag.total, true)
        .addField(`Genre listeners: `, data.tag.reach, true);
      if (/ +/gi.test(content)) {
        embed.addField(
          `Information: `,
          client.snippets.truncate(content),
          true
        );
      }
      embed
        .setFooter(`Command executed by ${tag}`, avatarURL)
        .setTimestamp();
      await message.channel.send({ embed });
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = GenreInfoCommand;