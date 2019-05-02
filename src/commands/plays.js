const { stringify } = require(`querystring`);
const fetch = require(`node-fetch`);
const { fetchuser } = require(`../utils/fetchuser`);

exports.run = async (client, message, args) => {
  const fetchUser = new fetchuser(client, message);
  let artistName = args.join(` `);
  const user = await fetchUser.get();
  if (!artistName) {
    if (!user) return message.reply(`you haven't registered your Last.fm ` +
    `account, therefore, I can't check what you're listening to. To set ` +
    `your Last.fm nickname, do \`&login <lastfm username\`.`);
    const username = user.lastFMUsername;
    const params = {
      method: `user.getrecenttracks`,
      user: username,
      api_key: client.config.lastFM.apikey,
      format: `json`
    };
    const query = stringify(params);
    const data = await fetch(client.config.lastFM.endpoint + query)
      .then(r => r.json());
    const track = data.recenttracks.track[0];
    if (!track[`@attr`])
      return message.reply(`currently, you are not listening to anything.`);
    else artistName = track.artist[`#text`];
  }
  try {
    if (!user) return message.reply(client.snippets.noLogin);
    const query = stringify({
      method: `artist.getinfo`,
      username: user.get(`lastFMUsername`),
      artist: artistName,
      api_key: client.config.lastFM.apikey,
      format: `json`
    });
    const data = await fetch(client.config.lastFM.endpoint + query)
      .then(r => r.json());

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
