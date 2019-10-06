const Library = require(`../lib/lastfm/index.js`);
const Command = require(`../classes/Command`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);
const { RichEmbed } = require(`discord.js`);

class ArtistinfoCommand extends Command {

  constructor() {
    super({
      name: `artistinfo`,
      description: `Returns information about a provided artist.`,
      usage: [`artistinfo`, `artistinfo <artist name>`],
      aliases: [`ai`],
      dmAvailable: true
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    const lib = new Library(client.config.lastFM.apikey);
    try {
      const fetchUser = new fetchuser(client, message);
      const username = await fetchUser.username();
      let artistName;
      if (args.length === 0) {
        const fetchTrack = new fetchtrack(client, message);
        const currTrack = await fetchTrack.getcurrenttrack();
        if (!currTrack) {
          message.reply(`currently, you are not listening to anything.`);
          this.context.reason = client.snippets.commonReasons.notPlaying;
          throw this.context;
        }
        artistName = currTrack.artist[`#text`];
      } else if (args[0]) {
        artistName = args.join(` `);
      } else {
        message.reply(`you must provide a name of your artist!`);
        this.context.reason = client.snippets.commonReasons.noArtist;
        throw this.context;
      }
      const data = await lib.artist.getInfo(artistName, username);
      const { name, url } = data.artist;
      const { listeners, playcount, userplaycount } = data.artist.stats;
      const { summary } = data.artist.bio;
      const tags = data.artist.tags.tag;
      const color = message.member ? message.member.displayColor : 16777215;
      const tagField = tags.map(t => `[${t.name}](${t.url})`).join(` - `);
      const href = `<a href="${url}">Read more on Last.fm</a>`;
      const desc = summary.slice(0, summary.length - href.length - 1);
      const embed = new RichEmbed()
        .setTitle(`Information about ${name}`)
        .setColor(color)
        .addField(`Listeners:`, listeners, true)
        .addField(`Scrobbles:`, playcount, true);
      if (tags.length > 0)
        embed.addField(`Tags:`, tagField, true);
      if (userplaycount)
        embed.addField(`User play count: `, userplaycount, true);
      if (desc.length > 0)
        embed.addField(`Summary:`, desc, true);
      embed
        .setFooter(`Command executed by ${message.author.tag}`, message.author.avatarURL)
        .setURL(url)
        .setTimestamp();
      await message.channel.send({ embed });
      return this.context;
    } catch (e) {
      if (e.message === `The artist you supplied could not be found`) {
        await message.reply(client.snippets.artistNotFound(args.join(` `)));
        this.context.reason = client.snippets.commonReasons.artistNotFound;
        throw this.context;
      } else {
        this.context.stack = e.stack;
        throw this.context;
      }
    }
  }

}

module.exports = ArtistinfoCommand;
