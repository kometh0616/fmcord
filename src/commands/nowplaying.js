const Command = require(`../classes/Command`);
const Library = require(`../lib/lastfm/index.js`);
const { RichEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);

class NowPlayingCommand extends Command {

  constructor() {
    super({
      name: `nowplaying`,
      description: `Shows you a song you are listening to right now.`,
      usage: [`nowplaying`],
      aliases: [`np`, `current`],
      dmAvailable: true,
    });
  }

  async run(client, message) {
    this.setContext(message);
    try {
      const color = message.member ? message.member.displayColor : 16777215;
      const lib = new Library(client.config.lastFM.apikey);
      const user = new fetchuser(client, message);

      if (await user.get()) {
        const ft = new fetchtrack(client, message);
        const track = await ft.getcurrenttrack(client, message);

        if (track) {
          const prevTrack = await ft.getlasttrack(client, message);
          const username = await user.username();
          const userData = await lib.user.getInfo(username);
          const embed = new RichEmbed()
            .addField(`Current:`, `**${track.name}** - ${track.artist[`#text`]} ` +
              `| ${track.album[`#text`] ? track.album[`#text`] : `no album`}`)
            .addField(`Previous:`,
              `**${prevTrack.name}** - ${prevTrack.artist[`#text`]} | ` +
              `${prevTrack.album[`#text`] ? prevTrack.album[`#text`] : `no album`}`)
            .setColor(color)
            .setTitle(`Last tracks from ${username}`)
            .setURL(userData.user.url)
            .setThumbnail(track.image[2][`#text`])
            .setFooter(`Command invoked by ${message.author.tag} with a total ` +
              `of ${userData.user.playcount} scrobbles.`)
            .setTimestamp();
          await message.channel.send({ embed });
          return this.context;
        } else {
          await message.reply(client.snippets.notPlaying);
          this.context.reason = client.snippets.commonReasons.notPlaying;
          throw this.context;
        }
      } else {
        await message.reply(client.snippets.noLogin);
        this.context.reason = client.snippets.commonReasons.noLogin;
        throw this.context;
      }
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = NowPlayingCommand;
