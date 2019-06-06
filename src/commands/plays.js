const Library = require(`../lib/index.js`);
const { fetchuser } = require(`../utils/fetchuser`);
const { fetchtrack } = require(`../utils/fetchtrack`);

exports.run = async (client, message, args) => {
  const lib = new Library(client.config.lastFM.apikey);
  const fetchUser = new fetchuser(client, message);
  const fetchTrack = new fetchtrack(client, message);
  try {
    let artistName = args.join(` `);
    const user = await fetchUser.username();
    if (!artistName) {
      if (!user) return message.reply(`you haven't registered your Last.fm ` +
      `account, therefore, I can't check what you're listening to. To set ` +
      `your Last.fm nickname, do \`&login <lastfm username\`.`);
      const track = await fetchTrack.getcurrenttrack();
      if (!track[`@attr`])
        return message.reply(`currently, you are not listening to anything.`);
      else artistName = track.artist[`#text`];
    }
    if (!user) return message.reply(client.snippets.noLogin);
    const data = await lib.artist.getInfo(artistName, user);

    const { name, stats } = data.artist;
    if (!stats.userplaycount) await message.reply(`you haven't ` +
    `scrobbled \`${name}\`.`);
    else await message.reply(`you have scrobbled \`${name}\` ` +
    `**${stats.userplaycount}** times.`);

  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `plays`,
  description: `Shows you how many times you have played an artist. If no ` +
  `artist is defined, the bot will look up an artist you are currently ` +
  `listening to.`,
  usage: `plays <artist name>`
};
