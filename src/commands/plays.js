const Command = require(`../classes/Command`);
const Library = require(`../lib/index.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);

class PlaysCommand extends Command {

  constructor() {
    super({
      name: `plays`,
      description: `Shows you how many times you have played an artist. If no ` +
      `artist is defined, the bot will look up an artist you are currently ` +
      `listening to.`,
      usage: `plays <artist name>`,
      aliases: [`p`],
      dmAvailable: true,
    });
  }

  async run(message, args) {
    this.setContext(message);
    try {
      const lib = new Library(message.client.config.lastFM.apikey);
      const fetchUser = new fetchuser(message.client, message);
      const fetchTrack = new fetchtrack(message.client, message);
      let artistName = args.join(` `);
      const user = await fetchUser.username();
      if (!artistName) {
        if (!user) {
          await message.reply(`you haven't registered your Last.fm ` +
          `account, therefore, I can't check what you're listening to. To set ` +
          `your Last.fm nickname, do \`${message.client.config.prefix}login ` +
          `<lastfm username>\`.`);
          this.context.reason = message.client.snippets.commonReasons.noLogin;
          throw this.context;
        }
        const track = await fetchTrack.getcurrenttrack();
        if (!track[`@attr`]) {
          await message.reply(message.client.snippets.notPlaying);
          this.context.reason = message.client.snippets.commonReasons.notPlaying;
          throw this.context;
        } else {
          artistName = track.artist[`#text`];
        }
      }
      if (!user) {
        await message.reply(message.client.snippets.noLogin);
        this.context.reason = message.client.snippets.commonReasons.noLogin;
        throw this.context;
      }
      const data = await lib.artist.getInfo(artistName, user);

      const { name, stats } = data.artist;
      if (!stats.userplaycount || stats.userplaycont === `0`)
        await message.reply(`you haven't scrobbled \`${name}\`.`);
      else await message.reply(`you have scrobbled \`${name}\` ` +
      `**${stats.userplaycount}** times.`);
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = PlaysCommand;
