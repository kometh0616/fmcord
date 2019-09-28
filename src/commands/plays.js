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
      usage: [`plays`, `plays <artist name>`],
      aliases: [`p`],
      dmAvailable: true,
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      const lib = new Library(client.config.lastFM.apikey);
      const fetchUser = new fetchuser(client, message);
      const fetchTrack = new fetchtrack(client, message);
      let artistName = args.join(` `);
      const user = await fetchUser.username();
      if (!artistName) {
        if (!user) {
          await message.reply(client.snippets.npNoLogin);
          this.context.reason = client.snippets.commonReasons.noLogin;
          throw this.context;
        }
        const track = await fetchTrack.getcurrenttrack();
        if (!track[`@attr`]) {
          await message.reply(client.snippets.notPlaying);
          this.context.reason = client.snippets.commonReasons.notPlaying;
          throw this.context;
        } else {
          artistName = track.artist[`#text`];
        }
      }
      if (!user) {
        await message.reply(client.snippets.noLogin);
        this.context.reason = client.snippets.commonReasons.noLogin;
        throw this.context;
      }
      const data = await lib.artist.getInfo(artistName, user);

      const { name, stats } = data.artist;
      if (!stats.userplaycount || stats.userplaycount === `0`) {
        await message.reply(`you haven't scrobbled \`${name}\`.`);
      } else {
        await message.reply(`you have scrobbled \`${name}\` ` +
        `**${stats.userplaycount}** times.`);
      }
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

module.exports = PlaysCommand;
