const YouTubeRequest = require(`../utils/YouTubeRequest`);
const { fetchtrack } = require(`../utils/fetchtrack`);
const { fetchuser } = require(`../utils/fetchuser`);
exports.run = async (client, message, args) => {
  const youtube = new YouTubeRequest(client.config.youtube.apikey);
  const fetchUser = new fetchuser(client, message);
  const fetchTrack = new fetchtrack(client, message);
  try {
    let query;
    if (args.length === 0) {
      const user = await fetchUser.username();
      if (!user) {
        return message.reply(client.snippets.noLogin);
      }
      const data = await fetchTrack.getcurrenttrack();
      if (!data) {
        return message.reply(client.snippets.notPlaying);
      }
      query = `${data.artist[`#text`]} ${data.name}`;
    } else {
      query = args.join(` `);
    }
    const result = await youtube.search(query);
    const item = result.items[0];
    if (!item) {
      return message.reply(`no results found on \`${query}\``);
    }
    const URL = `https://youtu.be/${item.id.videoId}`;
    await message.reply(`result for \`${query}\`: ${URL}`);
  } catch (e) {
    console.error(e);
    await message.channel.send(client.snippets.error);
  }
};

exports.help = {
  name: `yt`,
  description: `Gets a YouTube link of a searched song or video`,
  usage: `yt <search query>`
};
