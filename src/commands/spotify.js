const Command = require(`../classes/Command`);
const Spotify = require(`../lib/spotify/index`);
const { fetchtrack } = require(`../utils/fetchtrack`);

class SpotifyCommand extends Command {

  constructor() {
    super({
      name: `spotify`,
      description: `Gets a link of a song from Spotify. If no song is provided, ` +
      `the bot will try to get your currently played track.`,
      usage: [`spotify <song name>`, `spotify`],
      aliases: [`sp`]
    });
  }

  async run(client, message, args) {
    this.setContext(message);
    try {
      const { spotify } = client.config;
      if (!spotify || !spotify.id || !spotify.secret) {
        await message.reply(`some of the Spotify API credentials are missing, ` +
        `therefore, this command cannot be used. Please contact the maintainer ` +
        `of this bot.`);
        this.context.reason = `Spotify credentials are missing.`;
        throw this.context;
      }
      const lib = new Spotify(spotify.id, spotify.secret);
      if (args.length > 0) {
        const track = await lib.findTrack(args.join(` `));
        await message.channel.send(track.tracks.items[0].external_urls.spotify);
      } else {
        const fetchTrack = new fetchtrack(client, message);
        let song = await fetchTrack.getcurrenttrack();
        if (!song) {
          song = await fetchTrack.getlasttrack();
        }
        const track = await lib.findTrack(song.name);
        await message.channel.send(track.tracks.items[0].external_urls.spotify);
      }
      return this.context;
    } catch (e) {
      this.context.stack = e.stack;
      throw this.context;
    }
  }

}

module.exports = SpotifyCommand;