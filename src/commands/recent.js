const Command = require(`../classes/Command`);
const Library = require(`../lib/index.js`);
const { RichEmbed } = require(`discord.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const getDiscordUser = require(`../utils/DiscordUserGetter`);

class RecentCommand extends Command {

  constructor() {
    super({
      name: `recent`,
      description: `Shows you recent tracks you, or a user you defined, have listened to.`,
      usage: `recent [target user]`,
      notes: `If you are listening to a song while invoking this command, it will ` +
      `show your currently listened song as well. The target user must be in the ` +
      `same guild that you are invoking this command into.`,
      aliases: [`r`, `latest`],
      dmAvailable: true,
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      const color = message.member ? message.member.displayColor : 16777215;
      const lib = new Library(client.config.lastFM.apikey);
      const fetchUser = new fetchuser(client, message);
      let user;
      if (args[0]) {
        const member = getDiscordUser(message, args.join(` `));
        if (!member) {
          await message.reply(client.snippets.userNotFound);
          this.context.reason = client.snippets.commonReasons.userNotFound;
          throw this.context;
        }
        user = await fetchUser.usernameFromId(member.id);
        if (!user) {
          await message.reply(client.snippets.userNoLogin);
          this.context.reason = client.snippets.commonReasons.userNoLogin;
          throw this.context;
        }
      } else {
        user = await fetchUser.username();
        if (!user) {
          await message.reply(client.snippets.noLogin);
          this.context.reason = client.snippets.commonReasons.noLogin;
          throw this.context;
        }
      }
      const data = await lib.user.getRecentTracks(user);
      const userData = await lib.user.getInfo(user);
      const nowPlaying = data.recenttracks.track[0];
      const sliceArgs = nowPlaying[`@attr`] && nowPlaying[`@attr`].nowplaying ?
        [1, 6] : [0, 5];
      const prevTracks = data.recenttracks.track
        .slice(...sliceArgs)
        .map(x => `**${x.name}** - ${x.artist[`#text`]} ` +
          `| ${x.album[`#text`] ? x.album[`#text`] : `no album`}`)
        .join(`\n`);
      const embed = new RichEmbed();
      if (nowPlaying[`@attr`] && nowPlaying[`@attr`].nowplaying)
        embed.addField(`Current:`,
          `**${nowPlaying.name}** - ${nowPlaying.artist[`#text`]} ` +
          `| ${nowPlaying.album[`#text`] ? nowPlaying.album[`#text`] : `no album`}`);
      embed
        .addField(`Previous:`, prevTracks)
        .setColor(color)
        .setTitle(`Last tracks from ${user}`)
        .setURL(userData.user.url)
        .setThumbnail(data.recenttracks.track[0].image[2][`#text`])
        .setFooter(`Command invoked by ${message.author.tag}. ` +
        `Target user's scrobbles: ${userData.user.playcount}.`)
        .setTimestamp();
      await message.channel.send({ embed });
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = RecentCommand;
