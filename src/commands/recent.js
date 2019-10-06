const Command = require(`../classes/Command`);
const getDiscordUser = require(`../utils/DiscordUserGetter`);
const { fetchuser } = require(`../utils/fetchuser`);
const Library = require(`../lib/lastfm/index`);
const FMcordEmbed = require(`../utils/FMcordEmbed`);

class RecentCommand extends Command {

  constructor() {
    super({
      name: `recent`,
      description: `Shows you recent tracks you, or a user you defined, have listened to.`,
      usage: [
        `recent`, 
        `recent <target user>`, 
        `recent s:<song amount>`,
        `recent songs:<song amount>`,
        `recent <target user> s:<song amount>`,
        `recent <target user> songs:<song amount>`
      ],
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
      const songArg = args.findIndex(x => x.startsWith(`s:`) || x.startsWith(`songs:`));
      let user, songLimit;
      if (songArg !== -1) {
        if (!songArg && args[1]) {
          await message.reply(`incorrect usage of a command! Correct usage would be:\n` +
          this.usage.map(x => `\`${client.prefix}${x}\``).join(`\n`));
          this.context.reason = `Incorrect usage.`;
          throw this.context;
        }
        if (!isNaN(parseInt(args[songArg].split(`:`)[1]))) {
          songLimit = parseInt(args[songArg].split(`:`)[1]);
          if (songLimit > 10 || songLimit < 1) {
            await message.reply(`you cannot have more than 10 or less than 1 song.`);
            this.context.reason = `Incorrect song amount.`;
            throw this.context;
          }
        } else {
          songLimit = 1;
        }
        if (args[1]) {
          user = getDiscordUser(message, args.slice(0, songArg).join(` `));
          if (!user) {
            await message.reply(client.snippets.userNotFound);
            this.context.reason = client.snippets.commonReasons.userNotFound;
            throw this.context;
          }
        } else {
          user = message.author;
        }
      } else {
        songLimit = 1;
        if (args.length > 0) {
          user = getDiscordUser(message, args.join(` `));
          if (!user) {
            await message.reply(client.snippets.userNotFound);
            this.context.reason = client.snippets.commonReasons.userNotFound;
            throw this.context;
          }
        } else {
          user = message.author;
        }
      }
      const fetchUser = new fetchuser(client, message);
      const username = await fetchUser.usernameFromId(user.id);
      if (!username) {
        if (user.id === message.author.id) {
          await message.reply(client.snippets.noLogin);
          this.context.reason = client.snippets.commonReasons.noLogin;
        } else {
          await message.reply(client.snippets.userNoLogin);
          this.context.reason = client.snippets.commonReasons.userNoLogin;
        }
        throw this.context;
      }
      const lib = new Library(client.config.lastFM.apikey);
      const userInfo = await lib.user.getInfo(username);
      const tracks = await lib.user.getRecentTracks(username);
      const nowPlaying = tracks.recenttracks.track.find(x => x[`@attr`] && x[`@attr`].nowplaying === `true`);
      const sliceArgs = !nowPlaying ? [0, songLimit] : [1, songLimit + 1];
      const previous = tracks.recenttracks.track
        .slice(...sliceArgs)
        .map(x => `**${x.name}** - ${x.artist[`#text`]} | ${x.album[`#text`] ? x.album[`#text`] : `no album`}`)
        .join(`\n`);
      const embed = new FMcordEmbed(message)
        .setTitle(`Last tracks from ${username}`)
        .setURL(userInfo.user.url)
        .setThumbnail(tracks.recenttracks.track[0].image[2][`#text`]);
      if (nowPlaying) {
        embed.addField(`Now playing`, `**${nowPlaying.name}** - ${nowPlaying.artist[`#text`]} | ` +
          nowPlaying.album[`#text`] ? nowPlaying.album[`#text`] : `no album`);
      }
      embed.addField(`Previous`, previous)
        .addField(`${username}'s scrobble amount`, userInfo.user.playcount);
      await message.channel.send(embed);
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = RecentCommand;
